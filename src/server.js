const app = require("./app");
const envVar = require("./config/EnvVariable");
const connectDB = require("./config/Db");

async function run() {
    try {
        await connectDB();
        app.listen(envVar.PORT, () => {
            console.log(`Server listening on port ${envVar.PORT}`);
        });
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}

run();