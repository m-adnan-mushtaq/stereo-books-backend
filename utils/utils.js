export const authorPopulatOptions={
    path:'author',
    model:'User',
    select:'name'
}


export const multiPartHeaders={
    "content-type": "multipart/form-data"
}


export const updateObject=(oldState,newProp)=>{
    return {...oldState,...newProp}
}
