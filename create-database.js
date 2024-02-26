const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/product_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}



// Define Schemas
const productSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: Number,
  cost: Number,
  stock: Number,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
});

const offerSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  price: Number,
  active: Boolean,
});

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  contact: {
    name: String,
    email: String,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
});

const salesOrderSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  quantity: Number,
  status: String,
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

// Create mongoose models based on schemas
const Product = mongoose.model('Product', productSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);
const Category = mongoose.model('Category', categorySchema);

// Connect to the database and insert data
async function connectAndInsertData() {
  try {
    await connectToDatabase();

    // Insert sample categories if they don't exist
    await insertSampleCategories();

    // Insert sample suppliers with relevant categories
    const [supplier1, supplier2, supplier3, supplier4, supplier5] = await insertSampleSuppliers();

    // Insert sample products associated with suppliers
    const laptop = await Product.create({
      name: 'Laptop',
      price: 1000,
      cost: 800,
      stock: 50,
      supplier: supplier1._id,
      category: supplier1.category,
    });

    const smartphone = await Product.create({
      name: 'Smartphone',
      price: 800,
      cost: 600,
      stock: 40,
      supplier: supplier2._id,
      category: supplier2.category,
    });

    console.log('Sample products inserted successfully');

    // Insert sample offers
    const offer1 = await Offer.create({
      products: [laptop._id, smartphone._id],
      price: 1800,
      active: true,
    });

    // Insert sample sales orders
    await SalesOrder.create({
      offer: offer1._id,
      quantity: 2,
      status: 'pending',
    });

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
    rl.close(); // Close the readline interface
  }
}

// Function to add a new category
async function addNewCategory() {
  try {
    const categoryName = await askQuestion('Enter new category name (required): ');

    // Create a new category
    const newCategory = await Category.create({
      name: categoryName,
    });

    console.log(`New category '${categoryName}' added successfully.`);
  } catch (error) {
    console.error('Error:', error.message);
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

// Helper function to ask a question in the console
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
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

// Insert sample suppliers with relevant categories
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



// Call the main function to connect and insert data
connectAndInsertData();
