// Required modules
const mongoose = require('mongoose');
const readline = require('readline');

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt the user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Function to add a new category
async function addNewCategory() {
  try {
    const category = await prompt('Enter category name: ');
    console.log(`Category '${category}' added successfully.`);
    // Logic to save the category to the database (if needed)
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to add a new product
async function addNewProduct() {
  try {
    // Gathering product details
    const name = await prompt('Enter product name: ');
    const category = await prompt('Enter product category: ');
    const price = parseFloat(await prompt('Enter product price: '));
    const cost = parseFloat(await prompt('Enter product cost: '));
    const stock = parseInt(await prompt('Enter product stock: '));

    // Listing existing suppliers
    const suppliers = await Supplier.find();
    console.log('\nExisting Suppliers:');
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.name}`);
    });

    // Prompting user to select or add a new supplier
    const supplierOption = await prompt('Select a supplier (enter number) or add a new supplier (type "new"): ');
    let supplier;

    if (supplierOption.toLowerCase() === 'new') {
      // Gathering new supplier details
      const supplierName = await prompt('Enter new supplier name (required): ');
      const supplierDescription = await prompt('Enter new supplier description: ');

      // Creating a new supplier
      supplier = await Supplier.create({
        name: supplierName,
        contact: { name: '', email: '' }, // Default values for contact
      });

      console.log(`New supplier '${supplierName}' added successfully.`);
    } else {
      const selectedSupplierIndex = parseInt(supplierOption) - 1;
      if (selectedSupplierIndex >= 0 && selectedSupplierIndex < suppliers.length) {
        supplier = suppliers[selectedSupplierIndex];
      }
    }

    // Creating the new product with the selected supplier
    const newProduct = await Product.create({
      name,
      category,
      price,
      cost,
      stock,
      supplier: supplier._id,
    });

    console.log(`Product '${name}' added successfully with supplier '${supplier.name}'.`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to view products by category
async function viewProductsByCategory() {
  try {
    // Finding all existing categories
    const existingCategories = await Product.distinct('category');

    // Displaying existing categories
    console.log('\nExisting Categories:');
    existingCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });

    // Prompting user to select an existing category or create a new one
    const categoryOption = await prompt('Select a category (enter number) or create a new one (type "new"): ');

    if (categoryOption.toLowerCase() === 'new') {
      // Creating a new category if the user chooses to
      await addNewCategory();
    } else {
      const selectedCategoryIndex = parseInt(categoryOption) - 1;
      if (selectedCategoryIndex >= 0 && selectedCategoryIndex < existingCategories.length) {
        const selectedCategory = existingCategories[selectedCategoryIndex];

        // Finding products by the selected category
        const products = await Product.find({ category: selectedCategory }).populate('supplier');

        if (products.length === 0) {
          console.log(`No products found for category '${selectedCategory}'.`);
          return;
        }

        // Displaying products with supplier information
        console.log(`\nProducts for category '${selectedCategory}':`);
        products.forEach((product) => {
          const supplierInfo = product.supplier ? `Supplier: ${product.supplier.name}` : 'No Supplier';
          console.log(`- ${product.name}, Price: $${product.price}, Stock: ${product.stock}, ${supplierInfo}`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to view products by supplier
async function viewProductsBySupplier() {
  try {
    // Listing existing suppliers
    const suppliers = await Supplier.find();

    // Displaying existing suppliers
    console.log('\nExisting Suppliers:');
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.name}`);
    });

    // Prompting user to select an existing supplier or create a new one
    const supplierOption = await prompt('Select a supplier (enter number) or create a new one (type "new"): ');

    if (supplierOption.toLowerCase() === 'new') {
      // Creating a new supplier if the user chooses to
      await addNewSupplier();
    } else {
      const selectedSupplierIndex = parseInt(supplierOption) - 1;
      if (selectedSupplierIndex >= 0 && selectedSupplierIndex < suppliers.length) {
        const selectedSupplier = suppliers[selectedSupplierIndex];

        // Finding products associated with the selected supplier
        const products = await Product.find({ supplier: selectedSupplier._id });

        if (products.length === 0) {
          console.log(`No products found for supplier '${selectedSupplier.name}'.`);
          return;
        }

        // Displaying products
        console.log(`\nProducts for supplier '${selectedSupplier.name}':`);
        products.forEach((product) => {
          console.log(`- Name: ${product.name}, Price: $${product.price}, Cost: $${product.cost}, Stock: ${product.stock}`);
        });
      } else {
        console.log('Invalid supplier selection. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to view all offers within a price range
async function viewOffersWithinPriceRange() {
  try {
    const minPrice = parseFloat(await prompt('Enter minimum price: '));
    const maxPrice = parseFloat(await prompt('Enter maximum price: '));

    // Finding offers within the price range
    const offers = await Offer.find({ price: { $gte: minPrice, $lte: maxPrice } });

    if (offers.length === 0) {
      console.log(`No offers found within the price range $${minPrice} - $${maxPrice}.`);
      return;
    }

    // Displaying offers
    console.log(`\nOffers within the price range $${minPrice} - $${maxPrice}:`);
    offers.forEach((offer) => {
      console.log(`- Offer ${offer._id}, Price: $${offer.price}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to view all offers that contain a product from a specific category
async function viewOffersByCategory() {
  try {
    // Finding all existing categories
    const existingCategories = await Product.distinct('category');

    // Displaying existing categories
    console.log('\nExisting Categories:');
    existingCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });

    // Prompting user to select an existing category or create a new one
    const categoryOption = await prompt('Select a category (enter number) or create a new one (type "new"): ');

    if (categoryOption.toLowerCase() === 'new') {
      // Creating a new category if the user chooses to
      await addNewCategory();
    } else {
      const selectedCategoryIndex = parseInt(categoryOption) - 1;
      if (selectedCategoryIndex >= 0 && selectedCategoryIndex < existingCategories.length) {
        const selectedCategory = existingCategories[selectedCategoryIndex];

        // Finding products in the selected category
        const products = await Product.find({ category: selectedCategory });

        if (products.length === 0) {
          console.log(`No products found for category '${selectedCategory}'.`);
          return;
        }

        // Finding offers that contain products from the selected category
        const offers = await Offer.find({ products: { $in: products.map((p) => p._id) } });

        if (offers.length === 0) {
          console.log(`No offers found containing products from category '${selectedCategory}'.`);
          return;
        }

        // Displaying offers
        console.log(`\nOffers containing products from category '${selectedCategory}':`);
        offers.forEach((offer) => {
          console.log(`- Offer ${offer._id}, Price: $${offer.price}`);
        });
      } else {
        console.log('Invalid category selection. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to create an order for products
async function createProductOrder() {
  try {
    const productName = await prompt('Enter product name: ');
    const quantity = parseInt(await prompt('Enter quantity: '));

    // Finding the product
    const product = await Product.findOne({ name: productName });

    if (!product) {
      console.log(`Product '${productName}' not found.`);
      return;
    }

    // Checking if there is enough stock
    if (quantity > product.stock) {
      console.log(`Not enough stock for product '${productName}'. Current stock: ${product.stock}`);
      return;
    }

    // Creating a sales order
    const salesOrder = await SalesOrder.create({
      offer: null, // Set to null for individual product orders
      quantity,
      status: 'pending',
    });

    console.log(`Order for product '${productName}' created successfully. Order ID: ${salesOrder._id}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to create an order for offers
async function createOfferOrder() {
  try {
    const offerId = await prompt('Enter offer ID: ');

    // Validating the offerId
    const mongoose = require('mongoose');
    const validOfferId = mongoose.Types.ObjectId.isValid(offerId) ? mongoose.Types.ObjectId(offerId) : null;

    if (!validOfferId) {
      console.log('Invalid offer ID format. Please enter a valid ObjectId.');
      return;
    }

    // Finding the offer
    const offer = await Offer.findById(validOfferId);

    if (!offer) {
      console.log(`Offer with ID '${validOfferId}' not found.`);
      return;
    }

    const quantity = parseInt(await prompt('Enter quantity: '));

    // Checking if there is enough stock for the entire offer
    const totalStockRequired = quantity * offer.products.length;
    const availableStock = Math.min(...offer.products.map((product) => product.stock));

    if (totalStockRequired > availableStock) {
      console.log(`Not enough stock for the entire offer. Available stock: ${availableStock}`);
      return;
    }

    // Calculating the total cost before discount
    const totalCostBeforeDiscount = quantity * offer.price;

    // Applying discount if the quantity is more than 10
    const discountPercentage = quantity > 10 ? 0.1 : 0; // 10% discount if quantity is more than 10
    const discountAmount = totalCostBeforeDiscount * discountPercentage;
    const totalCostAfterDiscount = totalCostBeforeDiscount - discountAmount;

    // Creating a sales order
    const salesOrder = await SalesOrder.create({
      offer: offer._id,
      quantity,
      status: 'pending',
      totalCost: totalCostAfterDiscount, // Save the discounted total cost in the sales order
    });

    console.log(`Order for offer ID '${validOfferId}' created successfully. Order ID: ${salesOrder._id}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to ship orders
async function shipOrders() {
  try {
    // Finding pending sales orders
    const pendingOrders = await SalesOrder.find({ status: 'pending' }).populate('offer');

    if (pendingOrders.length === 0) {
      console.log('No pending orders found.');
      return;
    }

    // Displaying pending orders with numbers
    console.log('\nPending Orders:');
    pendingOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id}, Quantity: ${order.quantity}, Status: ${order.status}`);
    });

    // Prompting user to select an order to ship
    const orderNumber = parseInt(await prompt('Enter the number of the order to ship: '));

    // Validating user input
    if (isNaN(orderNumber) || orderNumber < 1 || orderNumber > pendingOrders.length) {
      console.log('Invalid order number. Please enter a valid number.');
      return;
    }

    // Finding the selected order
    const selectedOrder = pendingOrders[orderNumber - 1];

    // Displaying order details for confirmation
    console.log('\nSelected Order:');
    console.log(`- Order ID: ${selectedOrder._id}`);
    console.log(`- Quantity: ${selectedOrder.quantity}`);
    console.log(`- Status: ${selectedOrder.status}`);
    
    // Calculating profit for offers
    if (selectedOrder.offer) {
      const offer = selectedOrder.offer;

      // Calculating the total cost of the products in the offer
      const totalCost = offer.products.reduce((sum, product) => sum + product.cost, 0);

      // Calculating the total revenue from the sale
      const totalRevenue = selectedOrder.quantity * offer.price;

      // Calculating the profit (excluding tax)
      const profitBeforeTax = totalRevenue - totalCost;

      // Applying the profit tax (30%)
      const profitTax = 0.3;
      const profitAfterTax = profitBeforeTax * (1 - profitTax);

      console.log(`Profit for offer ID '${offer._id}': $${profitAfterTax}`);

      // Updating offer with profit information
      offer.totalRevenue = (offer.totalRevenue || 0) + totalRevenue;
      offer.totalProfit = (offer.totalProfit || 0) + profitAfterTax;
      await offer.save();
    }

    // Updating sales order with revenue and profit information
    selectedOrder.totalRevenue = selectedOrder.offer ? selectedOrder.offer.totalRevenue : 0;
    selectedOrder.totalProfit = selectedOrder.offer ? selectedOrder.offer.totalProfit : 0;

    // Updating order status to 'shipped'
    selectedOrder.status = 'shipped';
    await selectedOrder.save();

    // Updating stock for individual product orders
    if (!selectedOrder.offer) {
      const product = await Product.findById(selectedOrder.product);

      if (!product) {
        console.log(`Product not found for order ID '${selectedOrder._id}'.`);
        return;
      }

      // Checking if there is enough stock
      if (selectedOrder.quantity > product.stock) {
        console.log(`Not enough stock for product '${product.name}'. Current stock: ${product.stock}`);
        return;
      }

      product.stock -= selectedOrder.quantity;
      await product.save();
      console.log(`Order ID '${selectedOrder._id}' (Product) shipped successfully.`);
    } else {
      // Updating stock for offers
      const offer = await Offer.findById(selectedOrder.offer);
      const productsInOffer = await Product.find({ _id: { $in: offer.products } });

      // Checking if there is enough stock for the entire offer
      const totalStockRequired = selectedOrder.quantity * productsInOffer.length;

      if (totalStockRequired > offer.price) {
        console.log(`Not enough stock for the entire offer. Available stock: ${offer.price}`);
        return;
      }

      // Decreasing stock for each product in the offer
      for (const product of productsInOffer) {
        product.stock -= selectedOrder.quantity;
        await product.save();
      }

      console.log(`Order ID '${selectedOrder._id}' (Offer) shipped successfully.`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to view suppliers
async function viewSuppliers() {
  try {
    // Finding all suppliers
    const suppliers = await Supplier.find();

    if (suppliers.length === 0) {
      console.log('No suppliers found.');
      return;
    }

    // Displaying suppliers
    console.log('\nSuppliers:');
    suppliers.forEach((supplier) => {
      console.log(`- ${supplier.name}, Contact: ${supplier.contact.name}, Email: ${supplier.contact.email}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to view all sales
async function viewSales() {
  try {
    // Finding all sales orders
    const salesOrders = await SalesOrder.find();

    if (salesOrders.length === 0) {
      console.log('No sales orders found.');
      return;
    }

    // Displaying sales orders
    console.log('\nSales Orders:');
    salesOrders.forEach((order) => {
      const orderDetails = order.offer ? `Offer ID: ${order.offer}` : 'Individual Product Order';
      console.log(`- Order ID: ${order._id}, ${orderDetails}, Quantity: ${order.quantity}, Status: ${order.status}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to view the sum of all profits
async function viewSumOfProfits() {
  try {
    // Finding all sales orders with associated offers
    const salesOrdersWithOffers = await SalesOrder.find({ offer: { $ne: null } }).populate('offer');

    if (salesOrdersWithOffers.length === 0) {
      console.log('No sales orders with associated offers found.');
      return;
    }

    // Calculating the sum of profits
    const sumOfProfits = salesOrdersWithOffers.reduce((sum, order) => sum + order.offer.price, 0);

    console.log(`Sum of all profits: $${sumOfProfits}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to prompt the user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Starting the main menu

async function mainMenu() {
  await connectToDatabase();
  try {
    console.log('\n=== Product Management System ===');
    console.log('1. Add new category');
    console.log('2. Add new product');
    console.log('3. View products by category');
    console.log('4. View products by supplier');
    console.log('5. View all offers within a price range');
    console.log('6. View all offers that contain a product from a specific category');
    console.log('7. View the number of offers based on the number of its products in stock');
    console.log('8. Create order for products');
    console.log('9. Create order for offers');
    console.log('10. Ship orders');
    console.log('11. Add a new supplier');
    console.log('12. View suppliers');
    console.log('13. View all sales');
    console.log('14. View sum of all profits');
    console.log('15. Exit');

    const option = await prompt('Select an option (1-15): ');

    switch (option) {
      case '1':
        await addNewCategory();
        break;
      case '2':
        await addNewProduct();
        break;
      case '3':
        await viewProductsByCategory();
        break;
      case '4':
        await viewProductsBySupplier();
        break;
      case '5':
        await viewOffersWithinPriceRange();
        break;
      case '6':
        await viewOffersByCategory();
        break;
      case '7':
        await viewOfferCountByStock();
        break;
      case '8':
        await createProductOrder();
        break;
      case '9':
        await createOfferOrder();
        break;
      case '10':
        await shipOrders();
        break;
      case '11':
        await addNewSupplier();
        break;
      case '12':
        await viewSuppliers();
        break;
      case '13':
        await viewSales();
        break;
      case '14':
        await viewSumOfProfits();
        break;
      case '15':
        console.log('Exiting the Product Management System. Goodbye!');
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid option. Please try again.');
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mainMenu();
  }
}

// Running the main menu
mainMenu();
