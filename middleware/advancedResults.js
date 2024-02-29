const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
    const reqQuery = {...req.query};

    const { select, sort : sortQ } = req.query;

    const removeFields = ["select", "sort", "limit", "page"];

    removeFields.forEach((field) => delete reqQuery[field]);
    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // create operators ($gt, $gte etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, (match)=>`$${match}`);

    try {
        // convert string to JSON object
        query =  model.find(JSON.parse(queryStr));
    } catch(err){
        console.error(err)
    }

    // Select fields
    if(select) {
        const fields = select.split(",").join(" ");
        query = query.select(fields);
    }

    // Sort
    let sortBy = "-createdAt";
    if(sortQ) {
        sortBy = sortQ.split(",").join(" ");
    }
    query = query.sort(sortBy);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const startIndex = (page - 1 ) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(skip).limit(limit);
    if(populate) {
        query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    const pagination = {};
    if(endIndex < total) {
        pagination.next={
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev={
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}

module.exports = advancedResults;