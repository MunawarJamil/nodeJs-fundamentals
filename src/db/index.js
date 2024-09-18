import mongoose from "mongoose";

const db_connection = async () => {
  try {
    // const connectionInstance =
    await mongoose.connect("mongodb://127.0.0.1:27017/chay-db");
    console.log("mongodb connected seccessfully");
  } catch (error) {
    console.log("failed to connect database ");
    process.exit(1);
  }
};

export default db_connection;

//database is another continent so try catch and async await is must
//database connection process
// 1 import mongoose
// 2 async function
// 3 try catch
// await mongoose.connct(db connection string/databasname )
// export async function
