import mongoose from 'mongoose';
import readline from 'readline';
export { Product, Offer, Supplier, SalesOrder, Category };


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
const Product = mongoose.model('Product', new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  cost: Number,
  stock: Number,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
}));

const Offer = mongoose.model('Offer', new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  price: Number,
  active: Boolean,
}));

const Supplier = mongoose.model('Supplier', new mongoose.Schema({
  name: String,
  contact: {
    name: String,
    email: String,
  },
}));

const SalesOrder = mongoose.model('SalesOrder', new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  quantity: Number,
  status: String,
}));

// Define the schema for the Category model
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ensure category names are unique
  },
  // Add additional fields as needed
});

const Category = mongoose.model('Category', categorySchema);

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

// Function to add a new supplier
async function addNewSupplier() {
  try {
    const supplierName = await askQuestion('Enter new supplier name (required): ');
    const supplierDescription = await askQuestion('Enter new supplier description: ');

    // Display existing categories
    await getExistingCategories();

    const categoryIndex = await askQuestion('Select a category (enter number) for the supplier: ');
    const selectedCategory = await Category.findOne({}, 'name').skip(parseInt(categoryIndex) - 1);

    // Create a new supplier with selected category
    const newSupplier = await Supplier.create({
      name: supplierName,
      description: supplierDescription,
      contact: { name: '', email: '' },
      category: selectedCategory._id,
    });

    console.log(`New supplier '${supplierName}' added successfully.`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to insert sample products
async function insertSampleProducts() {
  try {
    const sampleProducts = [
      { name: 'Laptop', category: 'Electronics', price: 1000, cost: 800, stock: 50 },
      { name: 'Smartphone', category: 'Electronics', price: 800, cost: 600, stock: 40 },
      { name: 'T-shirt', category: 'Clothing', price: 20, cost: 10, stock: 100 },
      { name: 'Refrigerator', category: 'Home Appliances', price: 1200, cost: 1000, stock: 30 },
      { name: 'Shampoo', category: 'Beauty & Personal Care', price: 10, cost: 5, stock: 80 },
      { name: 'Soccer Ball', category: 'Sports & Outdoors', price: 30, cost: 20, stock: 60 }
    ];

    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted successfully.');
  } catch (error) {
    console.error('Error inserting sample products:', error.message);
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

// Insert suppliers  
async function insertSampleSuppliers() {
  try {
    const categories = await Category.find({}, 'name');

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
    console.log('Sample suppliers inserted successfully');
    return suppliers;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Insert sample offers
async function insertSampleOffers() {
  // Sample offers data
  const sampleOffers = [
    { products: ['Laptop', 'Smartphone'], price: 1800, active: true },
    { products: ['T-shirt', 'Shampoo'], price: 30, active: true },
    { products: ['Refrigerator', 'Smartphone', 'Soccer Ball'], price: 1830, active: false }
  ];

  try {
    // Get product IDs for the offers
    const products = await Product.find({}, '_id name');

    // Map product names to their IDs
    const productMap = new Map(products.map(product => [product.name, product._id]));

    // Transform offer data to include product IDs
    const offersData = sampleOffers.map(offer => ({
      products: offer.products.map(productName => productMap.get(productName)),
      price: offer.price,
      active: offer.active
    }));

    // Insert offers into the database
    await Offer.insertMany(offersData);
    console.log('Sample offers inserted successfully.');
  } catch (error) {
    console.error('Error inserting sample offers:', error.message);
  }
}

// Sample data insertion
async function insertSampleData() {
  try {
    await connectToDatabase();
    await insertSampleCategories();
    await insertSampleSuppliers();
    await insertSampleProducts();
    await insertSampleOffers();
    console.log('Sample data insertion completed.');
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
}

// Insert sample data and display main menu
insertSampleData();

