import { NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_KEY);
const getActiveProducts = async () => {
  //katalogdaki bütün ürünler
  let stripeProducts = await stripe.products.list();
  //aktif ürünleri al
  //console.log(stripeProducts.data);
  return stripeProducts.data.filter((i) => i.active);
};
export const POST = async (req) => {
  try {
    //1)araç verisine eriş
    const product = await req.json();
    //2)stripe catalog una kaydedilmiş ürünleri al
    const stripeProducts = await getActiveProducts();
    //3)satın alınacak ürün katalogda var mı
    let foundProduct = stripeProducts.find((i) => i.name === product.model);
    //4)yok ise ekle
    if (!foundProduct) {
      foundProduct = await stripe.products.create({
        name: product.make + " " + product.model,
        images: [product.imageUrl],
        default_price_data: {
          unit_amount: product.price * 100,
          currency: "USD",
        },
        metadata: {
          product_id: product._id,
        },
      });
    }
    // console.log(foundProduct);
    //5) ürünün stripe id sini ve  alınan miktarını bir nesneye koy
    const product_info = {
      price: foundProduct.default_price,
      quantity: 1,
    };
    //6) ödeme oturumu (url) oluştur
    const session = await stripe.checkout.sessions.create({
      line_items: [product_info],
      mode: "payment",
      success_url: baseUrl + "/success",
      cancel_url: baseUrl + "/cancel",
    });
    //7)satın alım url yi cliente gönder
    return NextResponse.json({
      url: session.url,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Ödeme oturumu oluşturulurken hata meydana geldi" },
      { status: 500 }
    );
  }
};
