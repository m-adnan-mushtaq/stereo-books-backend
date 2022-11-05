import categories from "../mock/cat.js"
import Book from "../models/Book.js"
import { authorPopulatOptions } from "../utils/utils.js"
import User from "../models/User.js"
async function homePageDataHandler(req, res) {
    try {

        //find most recent books
        const recentBooks = await Book.find().sort({ createdAt: 'desc' }).populate(authorPopulatOptions).limit(6)
        // find random category
        let randomCat = categories[Math.floor(Math.random() * categories.length)]
        const randomBooks = await Book.find({ category: randomCat }).populate(authorPopulatOptions).limit(6)

        res.json({
            randomCat,
            randomBooks,
            recentBooks
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
        console.error(error.message);
    }

}

function getCategoriesHanlder(req,res) {
    res.json(categories)
}

async function getUsersHandler(req,res){
    try {
        const users=await User.find().select('-email')
        res.json(users)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error:error.message
        })
    }
}
export {homePageDataHandler,getCategoriesHanlder,getUsersHandler}