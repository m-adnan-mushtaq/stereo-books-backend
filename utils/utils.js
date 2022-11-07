 const authorPopulatOptions={
    path:'author',
    model:'User',
    select:'name'
}


 const multiPartHeaders={
    "content-type": "multipart/form-data"
}


 const updateObject=(oldState,newProp)=>{
    return {...oldState,...newProp}
}

module.exports = {authorPopulatOptions,multiPartHeaders,updateObject}