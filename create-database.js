import mongoose from 'mongoose';
import readline from 'readline';

// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Webbshop', {});
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

// Define mongoose models based on schemas

const ProductSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: Number,
  cost: Number,
  stock: Number,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
});

const OfferSchema = new mongoose.Schema({
  products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
  price: Number,
  active: Boolean,
});

const SupplierSchema = new mongoose.Schema({
  name: String,
  description: String,
  contact: {
    name: String,
    email: String,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
});

const SalesOrderSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  status: String,
});

// Define the schema for the Category model
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
});

export const Product = mongoose.model('Product', ProductSchema);
export const Offer = mongoose.model('Offer', OfferSchema);
export const Supplier = mongoose.model('Supplier', SupplierSchema);
export const SalesOrder = mongoose.model('SalesOrder', SalesOrderSchema);
export const Category = mongoose.model('Category', categorySchema);

// Function to create a new category
async function createCategory(categoryName) {
  try {
    // Create a new category document
    const newCategory = await Category.create({ name: categoryName });
    console.log(`New category '${categoryName}' created successfully.`);
  } catch (error) {
    console.error('Error creating category:', error.message);
  }
}

// Function to get existing categories
async function getExistingCategories() {
  try {
    const categories = await Category.find({}, 'name');
    console.log('Existing Categories:');
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Helper function to ask a question in the console
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Insert sample categories
async function insertSampleCategories() {
  try {
    const categories = ['Electronics', 'Books', 'Medical', 'Shipyard', 'Food'];
    for (const categoryName of categories) {
      const existingCategory = await Category.findOne({ name: categoryName });
      if (!existingCategory) {
        await Category.create({ name: categoryName });
        console.log(`Category '${categoryName}' inserted successfully.`);
      } else {
        console.log(`Category '${categoryName}' already exists.`);
      }
    }
  } catch (error) {
    console.error('Error inserting categories:', error.message);
  }
}

async function insertSampleSuppliers() {
  try {
    const categories = await Category.find({}, '_id name');
    console.log('Categories:', categories);

    const suppliersData = [
      {
        name: 'Red-Haired Shanks Supplies',
        description: 'Supplies from the captain of the Red-Haired Pirates.',
        contact: { name: 'Shanks', email: 'shanks@redhairedsupplies.com' },
        category: categories.find(category => category.name === 'Shipyard')._id,
      },
      {
        name: 'Nico Robin Books & Artifacts',
        description: 'Specializing in rare books and historical artifacts.',
        contact: { name: 'Nico Robin', email: 'robin@booksandartifacts.com' },
        category: categories.find(category => category.name === 'Books')._id,
      },
      {
        name: 'Tony Tony Chopper Medicine Co.',
        description: 'Providing top-quality medical supplies and herbal remedies.',
        contact: { name: 'Tony Tony Chopper', email: 'chopper@medicineco.com' },
        category: categories.find(category => category.name === 'Medical')._id,
      },
      {
        name: 'Frankys Shipyard',
        description: 'Custom-built ships and high-tech gadgets.',
        contact: { name: 'Franky', email: 'franky@shipyard.com' },
        category: categories.find(category => category.name === 'Shipyard')._id,
      },
      {
        name: 'Sanjis Gourmet Ingredients',
        description: 'Delivering the finest ingredients for the most exquisite dishes.',
        contact: { name: 'Sanji', email: 'sanji@gourmetingredients.com' },
        category: categories.find(category => category.name === 'Food')._id,
      },
    ];

    

    const suppliers = await Supplier.create(suppliersData);
    return suppliers;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function insertSampleProducts() {
  try {
    const categories = await Category.find({}, '_id name');
    

    const suppliers = await Supplier.find({}, '_id name category');
    

    // Shuffle the suppliers array to randomize the selection process
    const shuffledSuppliers = suppliers.sort(() => Math.random() - 0.5);

    const sampleProducts = [
      { name: 'Smartphone', category: categories.find(cat => cat.name === 'Electronics')._id, price: 800, cost: 600, stock: 40 },
      { name: 'Naruto Shippuden', category: categories.find(cat => cat.name === 'Books')._id, price: 20, cost: 10, stock: 100 },
      { name: 'Bandaid', category: categories.find(cat => cat.name === 'Medical')._id, price: 1200, cost: 1000, stock: 30 },
      { name: 'Sushi', category: categories.find(cat => cat.name === 'Food')._id, price: 10, cost: 5, stock: 80 },
      { name: 'Anchor', category: categories.find(cat => cat.name === 'Shipyard')._id, price: 30, cost: 20, stock: 60 }
    ];

    

    // Iterate through each supplier and assign them a product
    for (let i = 0; i < Math.min(sampleProducts.length, suppliers.length); i++) {
      const productData = sampleProducts[i];
      const supplier = shuffledSuppliers[i];

      // console.log(`Product ${productData.name} - Category: ${productData.category}, Supplier: ${supplier.name}`);

      // Assign the selected supplier to the product
      productData.supplier = supplier._id;

      // Create and save the product
      const product = new Product(productData);
      await product.save();
    }

  
  } catch (error) {
  
  }
}


//sampleoffers//
async function insertSampleOffers() {
  try {
    // Get all products from the database
    const products = await Product.find({}, '_id name price');

    // Randomly select products for each offer
    const offer1Products = getRandomProducts(products, 2);
    const offer2Products = getRandomProducts(products, 3);
    const offer3Products = getRandomProducts(products, 4);

    // Calculate total price for each offer
    const offer1Price = calculateTotalPrice(offer1Products);
    const offer2Price = calculateTotalPrice(offer2Products);
    const offer3Price = calculateTotalPrice(offer3Products);

    // Ensure total prices are valid numbers
    if (isNaN(offer1Price) || isNaN(offer2Price) || isNaN(offer3Price)) {
      throw new Error('Invalid total price for one or more offers.');
    }

    // Create offers
    const offers = [
      { products: offer1Products.map(product => product._id), price: offer1Price, active: true },
      { products: offer2Products.map(product => product._id), price: offer2Price, active: true },
      { products: offer3Products.map(product => product._id), price: offer3Price, active: true }
    ];

    // Insert offers into the database
    await Offer.insertMany(offers);
  } catch (error) {
    console.error('Error inserting sample offers:', error.message);
  }
}


// Function to randomly select products
function getRandomProducts(products, count) {
  const shuffledProducts = products.sort(() => Math.random() - 0.5);
  return shuffledProducts.slice(0, count);
}

// Function to calculate total price of products in an offer
function calculateTotalPrice(products) {
  return products.reduce((total, product) => total + product.price, 0);
}


// Sample data insertion
async function insertSampleData() {
  try {
    await connectToDatabase();
    await insertSampleCategories();
    await insertSampleSuppliers();
    await insertSampleProducts();
    await insertSampleOffers();
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
}


// Insert sample data and display main menu
insertSampleData();
