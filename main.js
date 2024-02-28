//Main

import mongoose from 'mongoose';
import readline from 'readline';
import { Product, Offer, Supplier, SalesOrder, Category } from './create-database.js';



// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Webbshop', {

    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

// Define readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// Function to add a new category ------ 1
async function addNewCategory() {
  try {
    const category = await prompt('Enter category name: ');
    
    // Create a new Category document and save it to the database
    const newCategory = new Category({ name: category });
    await newCategory.save();

    console.log(`Category '${category}' added successfully.`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

///// function to add a new product ---- 2
async function addNewProduct() {
  try {
    // Gathering product details
    const name = await prompt('Enter product name: ');

    // Query and list existing categories
    const categories = await Category.find();
    console.log('\nExisting Categories:');
    categories.forEach((category, index) => console.log(`${index + 1}. ${category.name}`));

    // Prompt the user to select a category or add a new one
    const categoryIndex = parseInt(await prompt('Select a category (enter number) or add a new one: '));
    let selectedCategory;

    if (!isNaN(categoryIndex) && categoryIndex > 0 && categoryIndex <= categories.length) {
      selectedCategory = categories[categoryIndex - 1];
    } else if (categoryIndex === categories.length + 1) {
      // User wants to add a new category
      const newCategoryName = await prompt('Enter the name of the new category: ');
      selectedCategory = await Category.create({ name: newCategoryName });
      console.log(`New category '${newCategoryName}' added successfully.`);
    } else {
      console.log('Invalid selection.');
      return;
    }

    // Gather other product details
    const price = parseFloat(await prompt('Enter product price: '));
    const cost = parseFloat(await prompt('Enter product cost: '));
    const stock = parseInt(await prompt('Enter product stock: '));

    // Listing existing suppliers
    const suppliers = await Supplier.find();
    console.log('\nExisting Suppliers:');
    suppliers.forEach((supplier, index) => console.log(`${index + 1}. ${supplier.name}`));

    // Creating the new product with the selected category
    const newProduct = await Product.create({
      name,
      category: selectedCategory._id,
      price,
      cost,
      stock,
      // Add supplier logic here if needed
    });

    console.log(`Product '${name}' added successfully with category '${selectedCategory.name}'.`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}


// Function to view products by category ---- 3
const viewProductsByCategory = async () => {
  try {
    // Finding all existing categories
    const existingCategories = await Category.find();

    // Displaying existing categories
    console.log('\nExisting Categories:');
    existingCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
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
          console.log(`No products found for category '${selectedCategory.name}'.`);
          return;
        }

        // Displaying products with supplier information
        console.log(`\nProducts for category '${selectedCategory.name}':`);
        products.forEach((product) => {
          const supplierInfo = product.supplier ? `Supplier: ${product.supplier.name}` : 'No Supplier';
          console.log(`- ${product.name}, Price: $${product.price}, Cost: $${product.cost}, Stock: ${product.stock}, ${supplierInfo}`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};



// Function to view products by supplier  ------ 4 
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

// Function to view all offers within a price range ------- 5
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

// 6 -------- view offers by category ---- 6
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

        // Calculate and display summary based on product stock availability
        const allProductsInStockCount = offers.filter(offer => offer.products.every(product => product.stock > 0)).length;
        const someProductsInStockCount = offers.filter(offer => offer.products.some(product => product.stock > 0)).length;
        const noProductsInStockCount = offers.filter(offer => offer.products.every(product => product.stock === 0)).length;

        console.log('\nSummary based on product stock availability:');
        console.log(`- Offers with all products in stock: ${allProductsInStockCount}`);
        console.log(`- Offers with some products in stock: ${someProductsInStockCount}`);
        console.log(`- Offers with no products in stock: ${noProductsInStockCount}`);
      } else {
        console.log('Invalid category selection. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
////  7 ----- view offer count by stock  7
const viewOfferCountByStock = async () => {
  try {
    // Fetch all offers
    const offers = await Offer.find().lean();

    // Initialize counters
    let allProductsInStockCount = 0;
    let someProductsInStockCount = 0;
    let noProductsInStockCount = 0;

    // Iterate through each offer
    for (const offer of offers) {
      // Initialize a flag to track stock availability
      let stockAvailable = true;

      // Iterate through each product in the offer
      for (const product of offer.products) {
        // Fetch the product details from the database
        const dbProduct = await Product.findById(product.product).select('stock').lean();

        // Check if the product exists and has stock available
        if (!dbProduct || dbProduct.stock <= 0) {
          stockAvailable = false;
          break; // Exit the loop if any product is out of stock
        }
      }

      // Update counters based on stock availability
      if (stockAvailable) {
        allProductsInStockCount++;
      } else if (offer.products.some(product => product.product && product.product.stock > 0)) {
        someProductsInStockCount++;
      } else {
        noProductsInStockCount++;
      }
    }

    // Output the results
    console.log('Offers with all products in stock:', allProductsInStockCount);
    console.log('Offers with some products in stock:', someProductsInStockCount);
    console.log('Offers with no products in stock:', noProductsInStockCount);
  } catch (error) {
    console.error('Error viewing offer count by stock:', error);
  }
};




/// ------ create products order  ----  8
async function createProductOrder() {
  try {
    // Fetch all existing products
    const products = await Product.find();

    // Display the list of products
    console.log('\nExisting Products:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Price: $${product.price}, Cost: $${product.cost}, Stock: ${product.stock}`);
    });

    // Prompt the user to select a product
    const productIndex = parseInt(await prompt('Select a product (enter number): ')) - 1;

    // Validate user input
    if (isNaN(productIndex) || productIndex < 0 || productIndex >= products.length) {
      console.log('Invalid product selection');
      return;
    }

    // Get the selected product
    const selectedProduct = products[productIndex];

    const quantity = parseInt(await prompt('Enter quantity: '));

    // Checking if there is enough stock
    if (quantity > selectedProduct.stock) {
      console.log(`Not enough stock for product '${selectedProduct.name}'. Current stock: ${selectedProduct.stock}`);
      return;
    }

    // Calculate total cost for the selected quantity
    const totalCost = selectedProduct.cost * quantity;

    // Creating a sales order for the selected product
    const salesOrder = await SalesOrder.create({
      offer: null, // Set to null for individual product orders
      product: selectedProduct._id, // Associate the sales order with the selected product
      quantity,
      price: selectedProduct.price, // Store the price of the product in the sales order
      cost: totalCost, // Store the total cost of the order
      status: 'pending',
    });

    console.log(`Order for product '${selectedProduct.name}' created successfully. Order ID: ${salesOrder._id}`);

    // Update stock for the selected product
    selectedProduct.stock -= quantity;
    await selectedProduct.save();

    // Calculate and update the sum of all profits
    await viewSumOfProfits();
  } catch (error) {
    console.error('Error:', error.message);
  }
}



/// 9------- Function to create order for offer ---- 9
async function createOfferOrder(offerId, quantity, additionalDetails) {
  try {
    // Check if the offer exists
    const offer = await Offer.findById(offerId);
    if (!offer) {
      console.log('Offer not found.');
      return;
    }

    // Create a new sales order
    const newOrder = new SalesOrder({
      offer: offerId,
      quantity,
      additionalDetails,
      status: 'pending', // Assuming the initial status is pending
    });

    // Save the new sales order to the database
    await newOrder.save();

    console.log('Sales order created successfully.');
  } catch (error) {
    console.error('Error creating sales order:', error.message);
  }
}


// 10 ----- Function to ship orders ----- 10
async function shipOrders() {
  try {
    // Find pending sales orders
    const pendingOrders = await SalesOrder.find({ status: 'pending' }).populate('offer product');

    if (pendingOrders.length === 0) {
      console.log('No pending orders found.');
      return;
    }

    // Display pending orders with numbers
    console.log('\nPending Orders:');
    pendingOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id}, Quantity: ${order.quantity}, Status: ${order.status}`);
    });

    // Prompt user to select an order to ship
    const orderNumber = parseInt(await prompt('Enter the number of the order to ship: '));

    // Validate user input
    if (isNaN(orderNumber) || orderNumber < 1 || orderNumber > pendingOrders.length) {
      console.log('Invalid order number. Please enter a valid number.');
      return;
    }

    // Find the selected order
    const selectedOrder = pendingOrders[orderNumber - 1];

    // Calculate profit for the order
    let totalProfit = 0;

    // Check if the order is an individual product order
    if (!selectedOrder.offer) {
      // Update stock for individual product orders
      const product = await Product.findById(selectedOrder.product);
      if (!product) {
        console.log(`Product not found for order ID '${selectedOrder._id}'.`);
        return;
      }

      // Calculate total revenue from the sale
      const totalRevenue = selectedOrder.quantity * product.price;

      // Calculate total cost of the products
      const totalCost = selectedOrder.quantity * product.cost;

      // Calculate profit (excluding tax)
      const profitBeforeTax = totalRevenue - totalCost;

      // Apply profit tax (30%)
      const profitTax = 0.3;
      totalProfit = profitBeforeTax * (1 - profitTax);
    } else {
      // For offers, calculate profit as before
      const offer = selectedOrder.offer;
      const totalCost = offer.products.reduce((sum, product) => sum + product.cost, 0);
      const totalRevenue = selectedOrder.quantity * offer.price;
      const profitBeforeTax = totalRevenue - totalCost;
      const profitTax = 0.3;
      totalProfit = profitBeforeTax * (1 - profitTax);
      offer.totalRevenue = (offer.totalRevenue || 0) + totalRevenue;
      offer.totalProfit = (offer.totalProfit || 0) + totalProfit;
      await offer.save();
    }

    // Update sales order with revenue, profit, and status information
    selectedOrder.totalRevenue = selectedOrder.offer ? selectedOrder.offer.totalRevenue : 0;
    selectedOrder.totalProfit = selectedOrder.offer ? selectedOrder.offer.totalProfit : totalProfit;
    selectedOrder.status = 'shipped';
    await selectedOrder.save();

    // Update stock for individual product orders or offers
    if (!selectedOrder.offer) {
      // Update stock for individual product orders
      const product = await Product.findById(selectedOrder.product);
      if (!product) {
        console.log(`Product not found for order ID '${selectedOrder._id}'.`);
        return;
      }
      // Check if there is enough stock
      if (selectedOrder.quantity > product.stock) {
        console.log(`Not enough stock for product '${product.name}'. Current stock: ${product.stock}`);
        return;
      }
      product.stock -= selectedOrder.quantity;
      await product.save();
      console.log(`Order ID '${selectedOrder._id}' (Product) shipped successfully.`);
    } else {
      // Update stock for offers
      const offer = await Offer.findById(selectedOrder.offer);
      if (!offer) {
        console.log(`Offer not found for order ID '${selectedOrder._id}'.`);
        return;
      }
      const productsInOffer = await Product.find({ _id: { $in: offer.products } });
      // Check if there is enough stock for the entire offer
      const totalStockRequired = selectedOrder.quantity * productsInOffer.length;
      if (totalStockRequired > offer.price) {
        console.log(`Not enough stock for the entire offer. Available stock: ${offer.price}`);
        return;
      }
      // Decrease stock for each product in the offer
      for (const product of productsInOffer) {
        product.stock -= selectedOrder.quantity;
        await product.save();
      }
      console.log(`Order ID '${selectedOrder._id}' (Offer) shipped successfully.`);
    }

    // Update profits in the database
    if (totalProfit !== 0) {
      console.log(`Total profit for the shipped order: $${totalProfit.toFixed(2)}`);
      // Store profits in the database
      selectedOrder.profit = totalProfit;
      await selectedOrder.save();
    }

    // Call the function to view the sum of all profits
    await viewSumOfProfits();
  } catch (error) {
    console.error('Error:', error.message);
  }
}








// Function to add a new supplier ---- 11
async function addNewSupplier() {
  try {
    const name = await prompt('Enter supplier name: ');
    const contactName = await prompt('Enter contact name: ');
    const email = await prompt('Enter contact email: ');

    // Find and display existing categories for the user to choose from
    const categories = await Category.find({}, 'name');
    console.log('\nExisting Categories:');
    categories.forEach((category, index) => console.log(`${index + 1}. ${category.name}`));

    // Prompt the user to select a category for the supplier
    const categoryIndex = parseInt(await prompt('Select a category (enter number): ')) - 1;

    // Validate user input for category selection
    if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= categories.length) {
      console.log('Invalid category selection');
      return;
    }

    // Get the selected category
    const selectedCategory = categories[categoryIndex];

    // Create the new supplier with the selected category
    const newSupplier = await Supplier.create({
      name,
      contact: { name: contactName, email },
      category: selectedCategory._id,
    });

    console.log(`Supplier '${name}' added successfully.`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}


// 12. Function to view suppliers ------- 12.
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

// 13. Function to view all sales ------- 13
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
async function viewSumOfProfits() {
  try {
    // Find all sales orders with associated offers
    const salesOrdersWithOffers = await SalesOrder.find({}).populate('offer product');

    if (salesOrdersWithOffers.length === 0) {
      console.log('No sales orders found.');
      return;
    }

    // Calculate the sum of profits
    let sumOfProfits = 0;
    for (const order of salesOrdersWithOffers) {
      let totalCost = 0;
      let totalRevenue = 0;

      // Calculate total cost and total revenue for the order
      if (order.offer) {
        const offer = order.offer;
        totalCost = offer.products.reduce((sum, product) => sum + product.cost, 0);
        totalRevenue = order.quantity * offer.price;
      } else {
        const product = order.product;
        totalCost = order.quantity * product.cost;
        totalRevenue = order.quantity * product.price;
      }

      // Calculate profit (excluding tax)
      const profitBeforeTax = totalRevenue - totalCost;
      const profitTax = 0.3;
      const profitAfterTax = profitBeforeTax * (1 - profitTax);
      
      // Add profit to the sum
      sumOfProfits += profitAfterTax;
    }

    console.log(`Sum of all profits: $${sumOfProfits.toFixed(2)}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}










// Function to prompt the user for input
const prompt = async (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};



// Define the main menu function
async function mainMenu() {
  await connectToDatabase(); // Connect to the database
  
  while (true) { // Loop indefinitely until a valid option is selected
    try {
      console.log('\n=== Product Management System ===');
      // Display the menu options
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

      // Prompt the user to select an option
      const option = await prompt('Select an option (1-15): ');

      // Check the selected option and perform corresponding actions
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
          console.log('Invalid option. Please try again.'); // Display error message for invalid option
          continue; // Restart the loop to prompt the user again
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

// Running the main menu once
mainMenu();
