import Category from "../models/Category.js"

export const createCategory = async (req,res)=>{
    try{
        const {name, description} = req.body;
        if(!name || !description){
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        const categoryDetails = await Category.create({
            name:name,
            description:description,
        })
        // console.log(categoryDetails);
        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        })


    }catch(error){
        console.log(error);
        return res.status(403).json({
            success: false,
            message: "Error while creating Category",
        })
    }
}

export const showAllCategory = async (req,res)=>{
    try {

        const allCategories = await Category.find({}, {name:true, description:true});
        return res.status(200).json({
            success: true,
            message: "All categories return successfully",
            allCategories,
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }

}


export const categoryPageDetails = async (req,res)=>{
    try {
        const {categoryId} = req.body;
        const selectedCategory = await Category.findById(categoryId)
                                            .populate("course")
                                            .exec();

        if(!selectedCategory){
            return res.status(400).json({
                success:false,
                message: "Category not found",
            })  
        }

        const diffrentCategory = await Category.find({_id: {$ne: categoryId}})
                                                .populate("course")
                                                .exec();

        //HW


        
        return res.status(200).json({
                success:true,
                data: {
                    selectedCategory,
                    diffrentCategory,
                }
        })
        
    } catch (error) {
        return res.status(500).json({
                success:false,
                message: "Error while fetching category page details",
                error: error.message,
        })
    }
}