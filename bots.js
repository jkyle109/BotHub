const concurrently = require("concurrently");

concurrently(
    [
        // Commands to run
        { command: "node rye.js", name: "rye bot" },
        { command: "node cat.js", name: "cat bot" },
    ],
    {
        // Concurrently settings
        prefix: "test {index} - {name}",
        killOthers: ["failure", "success"],
        restartTries: 3,
    }
).then(
    function onSuccess(exitInfo) {
        console.log("\n========\nSuccess\n========\n");
        // for (exitData in exitInfo) {
        //     console.log(
        //         `Index ${exitData}:\n\tCommand: ${exitData}\n\tExit Code: ${exitData}\n`
        //     );
        // }
        process.exit();
    },
    function onFailure(exitInfo) {
        console.log("\n========\nFailure\n========\n");
        // for (exitData in exitInfo) {
        //     console.log(
        //         `Index ${exitData}:\n\tCommand: ${exitData}\n\tExit Code: ${exitData}\n`
        //     );
        // }
        process.exit();
    }
);
