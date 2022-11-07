const User = require("../models/User.js")
async function listAuthorsHandler(req, res) {
    try {

        //get all uses
        const users=await User.find().select('name')

        res.json({authors:users})
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        console.error(error.message);
    }

}

module.exports= {listAuthorsHandler}