import { List } from "../schema/list.schema.js";
import { AsyncHandler } from "../utilities/AsyncHandler.js";
import { cloudinaryUploader } from "../utilities/cloudinary.js";
import { Responce } from "../utilities/Responce.js";
import { ApiError } from "../utilities/ApiError.js";
import { User } from "../schema/user.schema.js";
import mongoose from "mongoose";

function stringToBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined; // or return a default boolean value if needed
}

export let createList = AsyncHandler(async (req, res, next) => {
  console.log("hello");

  let {
    Bath,
    Beds,
    address,
    detail,
    furnished,
    name,
    offer,
    parking,
    rent,
    sell,
    amount,
  } = req.body;
  if (!req.files || req.files.length === 0) {
    throw new ApiError(401, "No files were uploaded.");
  }

  console.log(`my fi;e from multer ${req.files}`);
  let urls = [];
  for (const file of req.files) {
    const result = await cloudinaryUploader(file.path);
    urls.push(result.secure_url); // Assuming Cloudinary returns `secure_url`
  }
  let creation = await List.create({
    user: req.user._id,
    Bath,
    Beds,
    address,
    detail,
    furnished,
    name,
    offer,
    parking,
    rent,
    sell,
    amount,
    imageUrl: urls,
  });
  console.log(`my create of list ${creation}`);

  res.status(200).json(new Responce(200, creation, "create a list "));
});
export let ShowList = AsyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "User is not authenticated");
  }
  try {
    // let getList = await List.aggregate(
    //     [
    //         {
    //             $match: {
    //                 user: mongoose.Types.ObjectId(req.user?._id)
    //             }
    //         },
    //         {
    //             $sort:{
    //                 createdAt: 1
    //             }
    //         }
    //     ]
    // )
    let getList = await List.find({ user: req.user?._id });

    if (!getList) {
      throw new ApiError(404, "Error in agreegation");
    }
    res.status(200).json(new Responce(200, getList, "Sucessfully get list"));
  } catch (error) {
    throw new ApiError(404, "Error in get list");
  }
});

export const FullList = AsyncHandler(async (req, res, next) => {
  try {
    let { id } = req.params;

    let list = await List.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetail",
          pipeline: [
            {
              $project: {
                username: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$userDetail", 0] }, // Flatten the userDetails array
        },
      },
      {
        $project: {
          name: 1,
          detail: 1,
          address: 1,
          Bath: 1,
          Beds: 1,
          furnished: 1,
          offer: 1,
          parking: 1,
          rent: 1,
          sell: 1,
          imageUrl: 1,
          user: 1,
          amount: 1,
        },
      },
    ]);
    if (!list) {
      throw new ApiError(404, "not getting list");
    }
    console.log(` my list ${list}`);
    res.status(200).json(new Responce(200, list, "Sucessfully get full list"));
  } catch (error) {
    console.log(`error in get listing ${error} `);
  }
});

export const DeleteList = AsyncHandler(async (req, res, next) => {
  let { id } = req.params;
  let list = await List.findByIdAndDelete({ _id: id });
  if (!list) {
    throw new ApiError(404, "not getting list");
  }
  res.status(200).json(new Responce(200, list, "Sucessfully delete list"));
});

export const UpdateList = AsyncHandler(async (req, res, next) => {
  let { id } = req.params;
  let list = await List.findById({ _id: id });
  if (!list) {
    throw new ApiError(404, "not getting list");
  }
  res.status(200).json(new Responce(200, { list }, "Sucessfully update list"));
});

export const updataData = AsyncHandler(async (req, res, next) => {
  // Destructure the necessary fields from the request body
  let {
    Bath,
    Beds,
    address,
    detail,
    furnished,
    name,
    offer,
    parking,
    rent,
    sell,
    amount,
  } = req.body;
  let imageUrl = [];
  function countKeysWithPrefix(obj, prefix) {
    return Object.keys(obj).filter((key) => key.startsWith(prefix)).length;
  }
  const prefix = "imageUrl";
  const count = countKeysWithPrefix(req.body, prefix);
  for (let index = 0; index < count; index++) {
    imageUrl.push(`${req.body.imageUrl[0]}`);
  }

  let urls = [];

  for (const file of req.files) {
    try {
      // Assuming cloudinaryUploader uploads to Cloudinary and returns the result with secure_url
      const result = await cloudinaryUploader(file.path);
      urls.push(result.secure_url); // Add the secure URL to the array
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({ message: "Error uploading files" });
    }
  }
  console.log(imageUrl);

  imageUrl = imageUrl.map((val) => val.split(","));
  const flattenedArray = imageUrl.flat();
  imageUrl = [...flattenedArray, ...urls];
  console.log(`My new image url are ${imageUrl} ${typeof imageUrl}`);

  // Log the final imageUrl array (with both old and new URLs)
  console.log(`Final image URLs: ${imageUrl}, Type: ${typeof imageUrl}`);

  // Try to create or update the list entry in the database
  try {
    const creation = await List.create({
      user: req.user._id,
      Bath,
      Beds,
      address,
      detail,
      furnished,
      name,
      offer,
      parking,
      rent,
      sell,
      imageUrl, // This is now the combined array of old and new image URLs
      amount,
    });

    console.log(`Updated list: ${creation}`);

    res
      .status(200)
      .json(new Responce(200, creation, "Updated data for the list"));
  } catch (error) {
    console.error("Error creating/updating list:", error);
    res.status(500).json({ message: "Error creating/updating list" });
  }
});

export const getList = AsyncHandler(async (req, res, next) => {
  try {
    let {
      limit = 20,
      page = 1,
      searchTerm = "",
      sortBy = "createdAt",
      sortType = -1,
      offer,
      category,
      parking,
      furnished,
    } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);
    sortType = parseInt(sortType, 10);
    sortType = [1, -1].includes(sortType) ? sortType : -1;
    let skip = (page - 1) * limit;
    parking = stringToBoolean(parking);
    furnished = stringToBoolean(furnished);
    offer = stringToBoolean(offer);
    if (offer == undefined) {
      offer = { $in: [true, false] };
    }
    if (parking == undefined) {
      parking = { $in: [true, false] };
    }
    if (furnished == undefined) {
      furnished = { $in: [true, false] };
    }
    if (category === undefined) {
      category = "all";
    }

    let listing = await List.aggregate([
      {
        $match: {
          offer,
          parking,
          furnished,
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
            { address: { $regex: searchTerm, $options: "i" } }
          ],
          $expr: {
            $switch: {
              branches: [
                {
                  // If category is "all", return documents where either rent or sell is true
                  case: { $eq: [category, "all"] },
                  then: {
                    $or: [{ $eq: ["$rent", true] }, { $eq: ["$sell", true] }],
                  },
                },
                {
                  // If category is "rent", return documents where rent is true
                  case: { $eq: [category, "rent"] },
                  then: { $eq: ["$rent", true] },
                },
                {
                  // If category is "sell", return documents where sell is true
                  case: { $eq: [category, "sell"] },
                  then: { $eq: ["$sell", true] },
                },
              ],
              default: false, // Default case if none of the conditions match
            },
          },
        },
      },
      {
        $sort: {
          [sortBy]: sortType,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (!listing) {
      throw new ApiError(404, "Not getting list");
    }
    if (listing.length === 0) {
      listing = [];
    }
    return res
      .status(200)
      .json(new Responce(200, listing, "sucessfully listing"));
  } catch (error) {
    console.log(error, "in list");
  }
});

export let saleList = AsyncHandler(async (req, res, next) => {
    const limit = 2; // Number of items per page
    const page = parseInt(req.params.page) || 1; // Current page (default to 1)
    const skip = (page - 1) * limit; // Number of items to skip
  
    // Get the total count of items where `sell` is true
    const total = await List.countDocuments({ sell: true });
  
    // Fetch the paginated list of items
    const list = await List.aggregate([
      {
        $match: { sell: true }, // Match items where `sell` is true
      },
      {
        $skip: skip, // Skip items for pagination
      },
      {
        $limit: limit, // Limit the number of items per page
      },
    ]);
  
    // If no items are found, throw an error
    if (!list || list.length === 0) {
      throw new ApiError(404, "No items found");
    }
  
    // Send the response with the paginated list and total count
    res.status(200).json(
      new Responce(200, { list, total, page, limit }, "Successfully retrieved items")
    );
  });

  export let rentList = AsyncHandler(async (req, res, next) => {
    const limit = 2; // Number of items per page
    const page = parseInt(req.params.page) || 1; // Current page (default to 1)
    const skip = (page - 1) * limit; // Number of items to skip
  
    // Get the total count of items where `sell` is true
    const total = await List.countDocuments({ sell: true });
  
    // Fetch the paginated list of items
    const list = await List.aggregate([
      {
        $match: { rent: true }, // Match items where `sell` is true
      },
      {
        $skip: skip, // Skip items for pagination
      },
      {
        $limit: limit, // Limit the number of items per page
      },
    ]);
  
    // If no items are found, throw an error
    if (!list || list.length === 0) {
      throw new ApiError(404, "No items found");
    }
  
    // Send the response with the paginated list and total count
    res.status(200).json(
      new Responce(200, { list, total, page, limit }, "Successfully retrieved items")
    );
  });