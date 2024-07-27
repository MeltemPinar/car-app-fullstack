import { NextResponse } from "next/server";
import Vehicle from "../(models)/Vehicle";

export async function GET() {
  try {
    //veri tabanından bütün araçları
    const vehicles = await Vehicle.find();
    //clienta veri gönder
    return NextResponse.json({
      message: "Araçlar bulundu",
      data: vehicles,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Araç verileri alınırken bir sorun oluştu",
      },
      { status: 500 }
    );
  }
}
