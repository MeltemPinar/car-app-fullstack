import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Order from "../(models)/Order";

const stripe = require("stripe")(process.env.STRIPE_KEY);
//next.js in body işleme özelliğini kapat
export const config = {
  api: {
    bodyParser: false,
  },
};
//eğer ödeme başarılı olursa stripe buraya post isteği atacak. bizde  ödemenin başarılı olduğunu anlayıp gerekli güncellemeyi yapacağız
export async function POST() {
  //1)isteğin body kısmını text e çevir
  const body = await req.text();
  //2)gerekli header a eriş
  const signature = headers().get("stripe-signature");
  let event;
  //3)gerçekleşen ödeme ile alakalı verilere eriş
  try {
    stripe.webhooks.constructEvent(body, signature, process.env.WEBHOOK_KEY);
  } catch (err) {
    return NextResponse.json(
      { message: "webhook başarısız" },
      {
        status: 500,
      }
    );
  }
  //4)ödeme başarılı olduysa satın alınan ürün verilerine eriş
  if (event.type === "checkout.session.completed") {
    //ödeme verileri
    const session = event.data.object;
    //bu ödeme oturumunda satın alınan ürünlere eriş
    const line_items = await stripe.checkout.sessions.listLineItems(session.id);
    //ürün katalog verisine eriş
    const item = await stripe.products.retrieve(
      line_items.data[0].price.product
    );
    //kendi veritabanımıza eklenecek sipariş verisi oluştur
    const orderItem = {
      product: item.metadata.product_id,
      money_spend: line_items.data[0].amount_total,
      currency: line_items.data[0].price.type,
    };
    //satın alınan ürünü siparişler koleksiyonuna ekle
    await Order.create(orderItem);

    //clienta olumlu cevap gönder
    return NextResponse.json(
      {
        status: "success",
      },
      { status: 200 }
    );
  }
  //clienta olumsuz cevap gönder
  return NextResponse.json(
    {
      status: "fail",
    },
    { status: 500 }
  );
}
