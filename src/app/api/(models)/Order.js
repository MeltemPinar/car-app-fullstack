import mongoose, { Shema } from "mongoose";
mongoose.connect(process.env.MONGODB_URL);
mongoose.Promise = global.Promise;
const OrderShema = new Shema(
  {
    product: {
      type: mongoose.Shema.ObjectId,
      ref: "Vehicle",
    },
    money_spend: Number,
    currency: String,
    type: String,
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.models?.Order || mongoose.model("Order", OrderShema);
export default Order;
