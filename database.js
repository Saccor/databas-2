const mongoose = require('mongoose');

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
});

// Define Offer Schema
const offerSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  price: Number,
  active: Boolean,
});

// Define Supplier Schema
const supplierSchema = new mongoose.Schema({
  name: String,
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

// Insert sample data into the database
async function insertSampleData() {
  // Insert sample products
  const laptop = await Product.create({
    name: 'Laptop',
    category: 'Electronics',
    price: 1000,
    cost: 800,
    stock: 50,
  });

  const smartphone = await Product.create({
    name: 'Smartphone',
    category: 'Electronics',
    price: 800,
    cost: 600,
    stock: 40,
  });

  // Insert sample offers
  const offer1 = await Offer.create({
    products: [laptop._id, smartphone._id],
    price: 1800,
    active: true,
  });

  // Insert sample suppliers
  const electronicsSupplier = await Supplier.create({
    name: 'Electronics Supplier Inc.',
    contact: {
      name: 'John Doe',
      email: 'john@electronicsupplier.com',
    },
  });

  // Insert sample sales orders
  await SalesOrder.create({
    offer: offer1._id,
    quantity: 2,
    status: 'pending',
  });

  console.log('Sample data inserted successfully');
}

// Connect to the database and insert data
connectToDatabase()
  .then(() => insertSampleData())
  .catch((error) => console.error('Error:', error))
  .finally(() => mongoose.disconnect());
