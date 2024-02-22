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

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  cost: Number,
  stock: Number,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
});

// Define Offer Schema
const offerSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  price: Number,
  active: Boolean,
});

// Define Supplier Schema
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  contact: {
    name: String,
    email: String,
  },
});

// Define Sales Order Schema
const salesOrderSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  quantity: Number,
  status: String,
});

// Create mongoose models based on schemas
const Product = mongoose.model('Product', productSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);

// Connect to the database and insert data
async function connectAndInsertData() {
  try {
    await connectToDatabase();

    // Insert sample suppliers
    const [supplier1, supplier2, supplier3, supplier4, supplier5] = await insertSampleSuppliers();

    // Insert sample products associated with suppliers
    const laptop = await Product.create({
      name: 'Laptop',
      category: 'Electronics',
      price: 1000,
      cost: 800,
      stock: 50,
      supplier: supplier1._id,
    });

    const smartphone = await Product.create({
      name: 'Smartphone',
      category: 'Electronics',
      price: 800,
      cost: 600,
      stock: 40,
      supplier: supplier2._id,
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

// Function to add a new supplier
async function addNewSupplier() {
  try {
    const supplierName = await askQuestion('Enter new supplier name (required): ');
    const supplierDescription = await askQuestion('Enter new supplier description: ');

    // Create a new supplier
    const newSupplier = await Supplier.create({
      name: supplierName,
      description: supplierDescription,
      contact: { name: '', email: '' }, // Add default values for contact
    });

    console.log(`New supplier '${supplierName}' added successfully.`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to remove a supplier
async function removeSupplier() {
  try {
    const supplierName = await askQuestion('Enter the name of the supplier to remove: ');

    // Find and remove the supplier
    const removedSupplier = await Supplier.findOneAndRemove({ name: supplierName });

    if (removedSupplier) {
      console.log(`Supplier '${supplierName}' removed successfully.`);
    } else {
      console.log(`Supplier '${supplierName}' not found.`);
    }
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

// Insert sample suppliers with One Piece-themed names
async function insertSampleSuppliers() {
  const supplier1 = await Supplier.create({
    name: 'Red-Haired Shanks Supplies',
    description: 'Supplies from the captain of the Red-Haired Pirates.',
    contact: {
      name: 'Shanks',
      email: 'shanks@redhairedsupplies.com',
    },
  });

  const supplier2 = await Supplier.create({
    name: 'Nico Robin Books & Artifacts',
    description: 'Specializing in rare books and historical artifacts.',
    contact: {
      name: 'Nico Robin',
      email: 'robin@booksandartifacts.com',
    },
  });

  const supplier3 = await Supplier.create({
    name: 'Tony Tony Chopper Medicine Co.',
    description: 'Providing top-quality medical supplies and herbal remedies.',
    contact: {
      name: 'Tony Tony Chopper',
      email: 'chopper@medicineco.com',
    },
  });

  const supplier4 = await Supplier.create({
    name: 'Frankys Shipyard',
    description: 'Custom-built ships and high-tech gadgets.',
    contact: {
      name: 'Franky',
      email: 'franky@shipyard.com',
    },
  });

  const supplier5 = await Supplier.create({
    name: 'Sanjis Gourmet Ingredients',
    description: 'Delivering the finest ingredients for the most exquisite dishes.',
    contact: {
      name: 'Sanji',
      email: 'sanji@gourmetingredients.com',
    },
  });

  console.log('Sample suppliers inserted successfully');

  return [supplier1, supplier2, supplier3, supplier4, supplier5];
}

// Call the main function to connect and insert data
connectAndInsertData();
