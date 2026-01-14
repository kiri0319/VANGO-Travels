const query_find = (model) =>  async (req, res, next)=> {
    const reqQuery = {...req.query};
    console.log('Req Query object: ', reqQuery)
    const removeFields = ['select', 'sort'];
    removeFields.forEach(param=> delete reqQuery[param])
    console.log('Req query object after deletion: ', reqQuery);
    let queryStr = JSON.stringify(reqQuery);
    let query = model.find(JSON.parse(queryStr))
    //  let query = model.find(queryStr)
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        console.log("field",fields);
        query = query.select(fields)
    }
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        console.log("sort",sortBy);
        query = query.sort(sortBy)
    }
    else{
         query= query.sort('noofdays')
    }
    const results = await query;
    res.advancedResults = {
        success: true,
        count: results.length,
        data: results
    };
    next();
}
module.exports = query_find;


  // queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    // console.log("querystring",queryStr)
    // console.log("querystring",queryStr[queryStr[0]])
    // let query = model.find({"packageprice" : {$gt : 5000} })