import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./database/userdata.js";
import Items from "./database/Itemsdata.js";

dotenv.config();
const mongoURI = process.env.MONGODB_URI;
const SALT_ROUNDS = 12;

// ─── USERS ────────────────────────────────────────────────────────────────────
const users = [
  {
    firstname: "Aryan",
    lastname: "Mehta",
    Email: "aryan.mehta@example.com",
    contact_number: "9876543201",
    age: 21,
    password: "Aryan@123",
    address: "123 Main St, New York",
    city: "New York",
    bio: "CS undergrad, selling old books and electronics. DM for deals!",
    isAdmin: false,
  },
  {
    firstname: "Priya",
    lastname: "Sharma",
    Email: "priya.sharma@example.com",
    contact_number: "9876543202",
    age: 20,
    password: "Priya@456",
    address: "456 Oak St, San Francisco",
    city: "San Francisco",
    bio: "ECE student. Love fitness, selling gym gear and clothes.",
    isAdmin: false,
  },
  {
    firstname: "Rahul",
    lastname: "Verma",
    Email: "rahul.verma@example.com",
    contact_number: "9876543203",
    age: 22,
    password: "Rahul@789",
    address: "789 Pine St, Chicago",
    city: "Chicago",
    bio: "MTech AI. Selling gadgets and textbooks. Negotiable prices!",
    isAdmin: false,
  },
  {
    firstname: "Sneha",
    lastname: "Reddy",
    Email: "sneha.reddy@example.com",
    contact_number: "9876543204",
    age: 21,
    password: "Sneha@101",
    address: "101 Maple St, Austin",
    city: "Austin",
    bio: "Design student. Selling art supplies, stationery, and vintage clothes.",
    isAdmin: false,
  },
  {
    firstname: "Admin",
    lastname: "BuySell",
    Email: "admin@buysell.example.com",
    contact_number: "9876543205",
    age: 25,
    password: "Admin@BuySell#2025",
    address: "HQ, London",
    city: "London",
    bio: "Platform administrator. Contact for support.",
    isAdmin: true,
  },
];

// ─── ITEMS (built after users are inserted) ───────────────────────────────────
const buildItems = (userIds) => {
  const [aryan, priya, rahul, sneha] = userIds;

  return [
    // ─── Electronics ──────────────────────────────────────────────────────
    {
      itemname: "Sony WH-1000XM4 Wireless Headphones",
      itemprice: 18999,
      itemcategory: "Electronics",
      itemdescription:
        "Industry-leading noise cancellation with Dual Noise Sensor technology. 30-hour battery life, quick charge (10 min = 5 hrs). Touch sensor controls on ear cups. Speak-to-chat technology. Comes with original carry case and all accessories. Used for 6 months in excellent condition.",
      brand: "Sony",
      condition: "Like New",
      usageDuration: "6 months",
      location: "123 Main St, New York",
      seller_id: aryan,
      stock: 1,
      tags: ["headphones", "noise cancelling", "sony", "wireless", "audio"],
      specifications: [
        { key: "Battery Life", value: "30 hours" },
        { key: "Connectivity", value: "Bluetooth 5.0" },
        { key: "Driver Size", value: "40mm" },
        { key: "Frequency Response", value: "4Hz-40,000Hz" },
        { key: "Weight", value: "254g" },
      ],
    },
    {
      itemname: "Apple MacBook Air M1 (8GB/256GB)",
      itemprice: 62000,
      itemcategory: "Electronics",
      itemdescription:
        "Apple MacBook Air M1 chip, 8GB RAM, 256GB SSD. Space Grey. In perfect working condition. Battery health 91%. Comes with original charger and box. Used for 1 year. No scratches, minor wear on charger cable. Perfect for coding and ML projects.",
      brand: "Apple",
      condition: "Good",
      usageDuration: "1 year",
      location: "123 Main St, New York",
      seller_id: aryan,
      stock: 1,
      tags: ["laptop", "macbook", "apple", "m1", "mac"],
      specifications: [
        { key: "Processor", value: "Apple M1 8-core" },
        { key: "RAM", value: "8GB Unified Memory" },
        { key: "Storage", value: "256GB SSD" },
        { key: "Display", value: '13.3" Retina, 2560x1600' },
        { key: "Battery", value: "49.9Wh, ~18hrs" },
        { key: "OS", value: "macOS Sequoia" },
      ],
    },
    {
      itemname: "Realme GT Neo 3T 5G (12GB/256GB)",
      itemprice: 16500,
      itemcategory: "Electronics",
      itemdescription:
        "Realme GT Neo 3T in Dash Yellow color. 12GB RAM, 256GB storage. 80W fast charging. 120Hz AMOLED display. Barely used, all original accessories included — charger, case, original box. No scratches, in factory-fresh condition. Selling because upgraded to iPhone.",
      brand: "Realme",
      condition: "Like New",
      usageDuration: "4 months",
      location: "456 Oak St, San Francisco",
      seller_id: rahul,
      stock: 1,
      tags: ["smartphone", "realme", "5g", "android", "phone"],
      specifications: [
        { key: "Processor", value: "Qualcomm Snapdragon 870" },
        { key: "RAM", value: "12GB LPDDR5" },
        { key: "Storage", value: "256GB UFS 3.1" },
        { key: "Display", value: '6.62" FHD+ 120Hz AMOLED' },
        { key: "Battery", value: "5000mAh, 80W Fast Charging" },
        { key: "Camera", value: "64MP + 8MP + 2MP" },
      ],
    },
    {
      itemname: "Logitech MX Master 3S Wireless Mouse",
      itemprice: 5200,
      itemcategory: "Electronics",
      itemdescription:
        "Logitech MX Master 3S, ultra-fast MagSpeed electromagnetic scroll wheel, 8K DPI tracking, USB-C quick charge. Works on glass surfaces. Used for 3 months, mint condition. Comes with USB-C cable and Logi Bolt USB receiver. Perfect for developers and designers.",
      brand: "Logitech",
      condition: "Like New",
      usageDuration: "3 months",
      location: "456 Oak St, San Francisco",
      seller_id: rahul,
      stock: 1,
      tags: ["mouse", "logitech", "wireless", "productivity"],
      specifications: [
        { key: "DPI", value: "200-8000 DPI" },
        { key: "Connectivity", value: "Bluetooth / Logi Bolt" },
        { key: "Battery", value: "500 mAh, 70 days" },
        { key: "Buttons", value: "7 programmable" },
      ],
    },
    {
      itemname: "Boat Rockerz 450 Bluetooth Headphones",
      itemprice: 1299,
      itemcategory: "Electronics",
      itemdescription:
        "Boat Rockerz 450 in Luscious Black. 40mm audio drivers, 15-hour battery, foldable design. Micro-USB charging. Used for 1 year, working perfectly. Minor wear on ear cushions but audio quality is excellent. Good for daily commute and study sessions.",
      brand: "Boat",
      condition: "Good",
      usageDuration: "1 year",
      location: "789 Pine St, Chicago",
      seller_id: sneha,
      stock: 1,
      tags: ["headphones", "boat", "bluetooth", "budget"],
      specifications: [
        { key: "Driver", value: "40mm" },
        { key: "Battery", value: "15 hours" },
        { key: "Bluetooth", value: "5.0" },
      ],
    },
    {
      itemname: "Raspberry Pi 4 Model B (4GB)",
      itemprice: 3800,
      itemcategory: "Electronics",
      itemdescription:
        "Raspberry Pi 4 Model B 4GB RAM. Used for a semester-long IoT project. In perfect working condition. Comes with Raspberry Pi OS pre-installed on 32GB SD card, power supply, HDMI micro adapter. Great for hobbyists and embedded systems projects.",
      brand: "Raspberry Pi Foundation",
      condition: "Good",
      usageDuration: "8 months",
      location: "123 Main St, New York",
      seller_id: aryan,
      stock: 1,
      tags: ["raspberry pi", "iot", "embedded", "linux", "sbc"],
      specifications: [
        { key: "Processor", value: "Broadcom BCM2711 Quad-core" },
        { key: "RAM", value: "4GB LPDDR4" },
        { key: "USB", value: "2x USB 3.0, 2x USB 2.0" },
        { key: "Connectivity", value: "Wi-Fi, Bluetooth 5.0, Ethernet" },
      ],
    },

    // ─── Books ────────────────────────────────────────────────────────────
    {
      itemname: "Introduction to Algorithms (CLRS) 4th Edition",
      itemprice: 1400,
      itemcategory: "Books",
      itemdescription:
        "CLRS 4th edition by Cormen, Leiserson, Rivest, and Stein. The bible of algorithms! Some highlights in chapters 1-10 (my notes). Excellent condition overall. Original MRP ₹8999. Perfect for competitive programming, interviews, and DSA courses.",
      brand: "MIT Press",
      condition: "Good",
      usageDuration: "1 year",
      location: "123 Main St, New York",
      seller_id: aryan,
      stock: 1,
      tags: ["algorithms", "cs", "clrs", "programming", "textbook"],
      specifications: [
        { key: "Authors", value: "Cormen, Leiserson, Rivest, Stein" },
        { key: "Edition", value: "4th (2022)" },
        { key: "Pages", value: "1312" },
        { key: "Publisher", value: "MIT Press" },
      ],
    },
    {
      itemname: "Deep Learning (Goodfellow, Bengio, Courville)",
      itemprice: 1800,
      itemcategory: "Books",
      itemdescription:
        "The definitive textbook on deep learning by Goodfellow, Bengio, and Courville. Hardcover edition. Minimal annotations in first 3 chapters. Perfect for ML/AI courses. Original price ₹5999. Selling because I now use the online version.",
      brand: "MIT Press",
      condition: "Good",
      usageDuration: "6 months",
      location: "456 Oak St, San Francisco",
      seller_id: rahul,
      stock: 1,
      tags: ["deep learning", "AI", "ML", "neural networks", "textbook"],
      specifications: [
        { key: "Authors", value: "Goodfellow, Bengio, Courville" },
        { key: "Pages", value: "800" },
        { key: "Publisher", value: "MIT Press" },
      ],
    },
    {
      itemname: "Operating System Concepts (Silberschatz) 10th Ed",
      itemprice: 600,
      itemcategory: "Books",
      itemdescription:
        "Dinosaur book! OS Concepts 10th edition by Silberschatz. Used for OS course at IIIT. Some highlighted sections but overall in good shape. Original MRP ₹1499. Perfect for any student taking OS.",
      brand: "Wiley",
      condition: "Fair",
      usageDuration: "1.5 years",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 1,
      tags: ["os", "operating systems", "textbook", "cs"],
      specifications: [
        { key: "Edition", value: "10th" },
        { key: "Publisher", value: "Wiley" },
        { key: "Pages", value: "944" },
      ],
    },
    {
      itemname: "Signals and Systems (Oppenheim & Willsky)",
      itemprice: 550,
      itemcategory: "Books",
      itemdescription:
        "Oppenheim & Willsky Signals and Systems 2nd edition. Used for ECE courses. Some notes in margins and highlights. Good readable condition. MRP ₹1200. Useful for GATE prep too.",
      brand: "Pearson",
      condition: "Good",
      usageDuration: "1 year",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 1,
      tags: ["signals", "systems", "ECE", "textbook", "gate"],
      specifications: [
        { key: "Edition", value: "2nd" },
        { key: "Publisher", value: "Pearson" },
      ],
    },

    // ─── Fitness ─────────────────────────────────────────────────────────────
    {
      itemname: "Decathlon Adjustable Dumbbell Set (2kg–20kg)",
      itemprice: 4500,
      itemcategory: "Fitness",
      itemdescription:
        "Decathlon adjustable dumbbells, 2kg to 20kg each side. Includes bar and plates. Used for 1 year in hostel room. Rubber coating intact, no rust. Perfect for a home/hostel gym setup. Selling because I got a gym membership.",
      brand: "Decathlon",
      condition: "Good",
      usageDuration: "1 year",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 1,
      tags: ["dumbbells", "weights", "gym", "fitness", "workout"],
      specifications: [
        { key: "Weight Range", value: "2kg to 20kg" },
        { key: "Bar Material", value: "Chrome-plated steel" },
        { key: "Plate Material", value: "Rubber-coated iron" },
      ],
    },
    {
      itemname: "Yoga Mat 6mm (Decathlon, Anti-slip)",
      itemprice: 799,
      itemcategory: "Fitness",
      itemdescription:
        "Decathlon Comfort 6mm yoga mat in teal blue. Non-slip surface on both sides. Includes carry strap. Washed and cleaned. Used for 6 months. Perfect for yoga, Pilates, and stretching. Lightweight at 700g.",
      brand: "Decathlon",
      condition: "Good",
      usageDuration: "6 months",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 1,
      tags: ["yoga", "mat", "fitness", "decathlon", "exercise"],
      specifications: [
        { key: "Thickness", value: "6mm" },
        { key: "Size", value: "173cm x 61cm" },
        { key: "Material", value: "NBR Foam" },
        { key: "Weight", value: "700g" },
      ],
    },
    {
      itemname: "Resistance Bands Set (5 levels)",
      itemprice: 599,
      itemcategory: "Fitness",
      itemdescription:
        "Premium resistance bands set with 5 levels — 10lb, 20lb, 30lb, 40lb, 50lb. Latex material. Includes carry bag, door anchor, ankle straps, and handles. Barely used. Great for full-body workouts in your hostel room.",
      brand: "SLOVIC",
      condition: "Like New",
      usageDuration: "2 months",
      location: "789 Pine St, Chicago",
      seller_id: sneha,
      stock: 2,
      tags: ["resistance bands", "gym", "fitness", "workout"],
      specifications: [
        { key: "Levels", value: "5 (10-50 lbs)" },
        { key: "Material", value: "Natural Latex" },
        { key: "Includes", value: "Handles, Door Anchor, Ankle Straps" },
      ],
    },
    {
      itemname: "Nike Air Zoom Pegasus 40 Running Shoes (UK 9)",
      itemprice: 5500,
      itemcategory: "Fitness",
      itemdescription:
        "Nike Air Zoom Pegasus 40 in Black/White. UK size 9. Used for ~50km of running. Outsole has minor wear but midsole cushioning is fully intact. Original box and extra laces included. MRP ₹9995. Perfect for running and gym training.",
      brand: "Nike",
      condition: "Good",
      usageDuration: "5 months",
      location: "456 Oak St, San Francisco",
      seller_id: rahul,
      stock: 1,
      tags: ["shoes", "nike", "running", "fitness", "sports"],
      specifications: [
        { key: "Size", value: "UK 9 / US 10 / EU 43" },
        { key: "Color", value: "Black/White" },
        { key: "Type", value: "Running" },
        { key: "Sole", value: "Rubber, Air Zoom unit" },
      ],
    },

    // ─── Clothing ──────────────────────────────────────────────────────────
    {
      itemname: "H&M Olive Green Oversized Sweatshirt (M)",
      itemprice: 799,
      itemcategory: "Clothing",
      itemdescription:
        "H&M olive green oversized sweatshirt. Size M (fits M-L). 80% cotton, 20% polyester. Washed twice, no pilling or shrinkage. Great for campus casual days. MRP ₹2499. Selling because I bought a similar one.",
      brand: "H&M",
      condition: "Like New",
      usageDuration: "3 months",
      location: "789 Pine St, Chicago",
      seller_id: sneha,
      stock: 1,
      tags: ["sweatshirt", "oversized", "h&m", "casual", "clothing"],
      specifications: [
        { key: "Size", value: "M (fits M-L)" },
        { key: "Color", value: "Olive Green" },
        { key: "Material", value: "80% Cotton, 20% Polyester" },
        { key: "Fit", value: "Oversized" },
      ],
    },
    {
      itemname: "Levi's 511 Slim Fit Jeans (32x30)",
      itemprice: 1800,
      itemcategory: "Clothing",
      itemdescription:
        "Levi's 511 Slim Fit jeans in medium stonewash. Size 32 waist, 30 inseam. Excellent condition, worn around 10 times. No fading or ripping. Original tag still attached. MRP ₹4999. Perfect campus jeans.",
      brand: "Levi's",
      condition: "Like New",
      usageDuration: "4 months",
      location: "456 Oak St, San Francisco",
      seller_id: rahul,
      stock: 1,
      tags: ["jeans", "levi's", "denim", "clothing", "slim fit"],
      specifications: [
        { key: "Size", value: "32W x 30L" },
        { key: "Color", value: "Medium Stonewash" },
        { key: "Fit", value: "Slim" },
        { key: "Material", value: "99% Cotton, 1% Elastane" },
      ],
    },
    {
      itemname: "Zara Black Leather Jacket (Faux, S)",
      itemprice: 2200,
      itemcategory: "Clothing",
      itemdescription:
        "Zara faux leather biker jacket in black. Size S. Worn 5-6 times, like new condition. No scratches or peeling. Comes with original bag. MRP ₹5999. Great for going out and making a statement.",
      brand: "Zara",
      condition: "Like New",
      usageDuration: "6 months",
      location: "789 Pine St, Chicago",
      seller_id: sneha,
      stock: 1,
      tags: ["jacket", "leather", "zara", "clothing", "fashion"],
      specifications: [
        { key: "Size", value: "S" },
        { key: "Material", value: "Faux Leather" },
        { key: "Color", value: "Black" },
      ],
    },

    // ─── Stationery ────────────────────────────────────────────────────────
    {
      itemname: "Staedtler Mars Lumograph Sketching Set (12pc)",
      itemprice: 699,
      itemcategory: "Stationery",
      itemdescription:
        "Staedtler Mars Lumograph professional sketching pencil set. Grades 2H to 8B — 12 pencils total. About 70% of each pencil remaining. Perfect for technical drawing, design courses, and art. Comes in the original tin.",
      brand: "Staedtler",
      condition: "Good",
      usageDuration: "1 year",
      location: "789 Pine St, Chicago",
      seller_id: sneha,
      stock: 2,
      tags: ["pencils", "sketching", "art", "staedtler", "drawing"],
      specifications: [
        { key: "Set", value: "12 pencils (2H to 8B)" },
        { key: "Core", value: "Black lead" },
        { key: "Case", value: "Metal tin" },
      ],
    },
    {
      itemname: "Leuchtturm1917 A5 Dotted Notebook (Hardcover)",
      itemprice: 999,
      itemcategory: "Stationery",
      itemdescription:
        "Leuchtturm1917 A5 hardcover dotted notebook in Navy Blue. 120gsm paper, ~50 pages used (rest blank). Numbered pages, table of contents filled. No bleed-through. MRP ₹1850. Perfect for bullet journaling and notes.",
      brand: "Leuchtturm1917",
      condition: "Good",
      usageDuration: "5 months",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 1,
      tags: ["notebook", "journal", "dotted", "bullet journal", "stationery"],
      specifications: [
        { key: "Size", value: "A5" },
        { key: "Paper", value: "80gsm, acid-free" },
        { key: "Pages", value: "249 numbered pages" },
        { key: "Color", value: "Navy Blue" },
      ],
    },
    {
      itemname: "Casio fx-991ES PLUS 2nd Edition Scientific Calculator",
      itemprice: 950,
      itemcategory: "Stationery",
      itemdescription:
        "Casio fx-991ES PLUS 2nd Edition. 417 functions including complex numbers, matrices, calculus. Solar + battery powered. Comes with original slide-on cover. Used throughout undergrad. Works perfectly. MRP ₹1550. Must-have for engineering.",
      brand: "Casio",
      condition: "Good",
      usageDuration: "2 years",
      location: "123 Main St, New York",
      seller_id: aryan,
      stock: 1,
      tags: ["calculator", "casio", "scientific", "engineering", "maths"],
      specifications: [
        { key: "Functions", value: "417" },
        { key: "Display", value: "Natural Textbook Display" },
        { key: "Power", value: "Solar + Battery" },
      ],
    },

    // ─── Food ─────────────────────────────────────────────────────────────
    {
      itemname: "Blue Tokai Coffee Roasters - Vienna Espresso (250g)",
      itemprice: 650,
      itemcategory: "Food",
      itemdescription:
        "Sealed pack of Blue Tokai Vienna Espresso blend. Whole bean, 250g. Dark roast with notes of dark chocolate and caramel. Roasted 2 weeks ago. Best before 3 months from today. Bought extra — selling 1 pack. Perfect for late-night coding sessions.",
      brand: "Blue Tokai",
      condition: "Brand New",
      usageDuration: "Unused",
      location: "123 Main St, New York",
      seller_id: aryan,
      stock: 2,
      tags: ["coffee", "blue tokai", "espresso", "beans", "food"],
      specifications: [
        { key: "Type", value: "Whole Bean" },
        { key: "Roast", value: "Dark" },
        { key: "Weight", value: "250g" },
        { key: "Origin", value: "Blend (India)" },
      ],
    },
    {
      itemname: "Barebells Protein Bars (12-Pack, Mixed Flavors)",
      itemprice: 1800,
      itemcategory: "Food",
      itemdescription:
        "Barebells high-protein bars, 12-pack assorted flavors. 20g protein per bar, low sugar. Bought in bulk, selling 12-pack. Best before Dec 2025. Flavors: Caramel Cashew, Cookies & Cream, Salty Peanut, White Chocolate Almond.",
      brand: "Barebells",
      condition: "Brand New",
      usageDuration: "Unused",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 3,
      tags: ["protein bars", "fitness", "snacks", "barebells", "food"],
      specifications: [
        { key: "Protein per bar", value: "20g" },
        { key: "Calories", value: "200 kcal" },
        { key: "Pack", value: "12 bars" },
        { key: "Flavors", value: "Assorted" },
      ],
    },

    // ─── Gaming ────────────────────────────────────────────────────────────
    {
      itemname: "PlayStation 4 Slim (1TB) + 2 Controllers",
      itemprice: 20000,
      itemcategory: "Gaming",
      itemdescription:
        "PS4 Slim 1TB in excellent condition. Includes 2 DualShock 4 controllers (both working perfectly), all cables, HDMI. Games: God of War (2018), FIFA 23, Uncharted 4. Console serviced and cleaned. No issues. Selling because upgrading to PS5.",
      brand: "Sony PlayStation",
      condition: "Good",
      usageDuration: "2.5 years",
      location: "456 Oak St, San Francisco",
      seller_id: rahul,
      stock: 1,
      tags: ["ps4", "playstation", "gaming", "console", "sony"],
      specifications: [
        { key: "Storage", value: "1TB HDD" },
        { key: "Controllers", value: "2x DualShock 4" },
        { key: "Games Included", value: "God of War, FIFA 23, Uncharted 4" },
        { key: "Output", value: "4K UHD Blu-ray" },
      ],
    },
    {
      itemname: "Nintendo Switch Lite (Coral) + Case",
      itemprice: 14500,
      itemcategory: "Gaming",
      itemdescription:
        "Nintendo Switch Lite in Coral. Used for 1 year. Screen in perfect condition — no scratches (used with screen protector from day 1). Includes travel case, charger. 2 games: Animal Crossing New Horizons and Mario Kart 8 Deluxe (cartridges). MRP ₹19999.",
      brand: "Nintendo",
      condition: "Good",
      usageDuration: "1 year",
      location: "789 Pine St, Chicago",
      seller_id: sneha,
      stock: 1,
      tags: ["nintendo", "switch", "gaming", "handheld", "console"],
      specifications: [
        { key: "Color", value: "Coral" },
        { key: "Display", value: '5.5" LCD, 1280x720' },
        { key: "Battery", value: "3-7 hours" },
        { key: "Games", value: "Animal Crossing, Mario Kart 8" },
      ],
    },

    // ─── Home & Living ──────────────────────────────────────────────────────
    {
      itemname: "Wipro Garnet 10W LED Desk Lamp (Adjustable)",
      itemprice: 899,
      itemcategory: "Home & Living",
      itemdescription:
        "Wipro Garnet LED desk lamp with 5 brightness levels and 3 color temperatures (warm, neutral, cool). USB-C powered. 360° rotating arm. Touch controls. Perfect for hostel study desk. Used for 6 months. Working perfectly.",
      brand: "Wipro",
      condition: "Good",
      usageDuration: "6 months",
      location: "123 Main St, New York",
      seller_id: aryan,
      stock: 1,
      tags: ["lamp", "desk lamp", "led", "study", "hostel"],
      specifications: [
        { key: "Power", value: "10W" },
        { key: "Color Temp", value: "3 modes (Warm/Neutral/Cool)" },
        { key: "Brightness", value: "5 levels" },
        { key: "Power Input", value: "USB-C 5V" },
      ],
    },
    {
      itemname: "Stainless Steel Water Bottle 1L (Milton)",
      itemprice: 349,
      itemcategory: "Home & Living",
      itemdescription:
        "Milton Thermosteel 1 litre stainless steel water bottle. Double-wall vacuum insulated. Keeps cold 24hrs, hot 18hrs. No rust or dents. Lid seal intact. Used for 4 months. Perfect for carrying to lectures and gym.",
      brand: "Milton",
      condition: "Good",
      usageDuration: "4 months",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 2,
      tags: ["water bottle", "insulated", "milton", "stainless steel"],
      specifications: [
        { key: "Capacity", value: "1 Litre" },
        { key: "Material", value: "Stainless Steel 304" },
        { key: "Insulation", value: "Double-wall vacuum" },
        { key: "Cold retention", value: "24 hours" },
        { key: "Hot retention", value: "18 hours" },
      ],
    },

    // ─── Sports ────────────────────────────────────────────────────────────
    {
      itemname: "Yonex Arcsaber 11 Badminton Racket",
      itemprice: 3800,
      itemcategory: "Sports",
      itemdescription:
        "Yonex Arcsaber 11 badminton racket. 4U (83g), G4 grip. BG65 strings at 24lbs. Used for inter-hostel tournament. Frame intact, no cracks. Grip replaced 2 months ago. Comes with original cover. MRP ₹8500.",
      brand: "Yonex",
      condition: "Good",
      usageDuration: "8 months",
      location: "456 Oak St, San Francisco",
      seller_id: rahul,
      stock: 1,
      tags: ["badminton", "racket", "yonex", "sports"],
      specifications: [
        { key: "Weight", value: "4U (83g)" },
        { key: "Grip Size", value: "G4" },
        { key: "Strings", value: "BG65 at 24lbs" },
        { key: "Balance", value: "Even" },
      ],
    },
    {
      itemname: "Nivia Street Soccer Football (Size 5)",
      itemprice: 799,
      itemcategory: "Sports",
      itemdescription:
        "Nivia Street Soccer ball size 5. Machine stitched, 32-panel construction. Used for hostel ground play — about 20 sessions. Holds air well, no punctures. Good for recreational play.",
      brand: "Nivia",
      condition: "Good",
      usageDuration: "6 months",
      location: "101 Maple St, Austin",
      seller_id: priya,
      stock: 1,
      tags: ["football", "soccer", "sports", "nivia"],
      specifications: [
        { key: "Size", value: "5" },
        { key: "Construction", value: "32-panel machine stitched" },
        { key: "Material", value: "PVC" },
      ],
    },

    // ─── Beauty & Care ──────────────────────────────────────────────────────
    {
      itemname: "Minimalist 10% Niacinamide Serum (30ml)",
      itemprice: 299,
      itemcategory: "Beauty & Care",
      itemdescription:
        "Minimalist 10% Niacinamide + 1% Zinc serum. 30ml, about 80% remaining. Used for 1 month, didn't suit my skin type. Stored away from sunlight, clean spatula used. Perfect for controlling sebum and reducing pores.",
      brand: "Minimalist",
      condition: "Good",
      usageDuration: "1 month",
      location: "789 Pine St, Chicago",
      seller_id: sneha,
      stock: 1,
      tags: ["serum", "niacinamide", "skincare", "minimalist", "beauty"],
      specifications: [
        { key: "Key Ingredient", value: "10% Niacinamide + 1% Zinc" },
        { key: "Volume", value: "30ml (80% remaining)" },
        { key: "Skin Type", value: "All skin types" },
      ],
    },
  ];
};

// ─── SEED ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected!");

    // Clear existing
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Items.deleteMany({});

    // Insert users with hashed passwords
    console.log("👥 Creating users...");
    const insertedUsers = [];
    const credentialLines = [
      "=== BuySell Global — Seeded User Credentials ===\n",
    ];

    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, SALT_ROUNDS);
      const newUser = new User({ ...u, password: hashed });
      await newUser.save();
      insertedUsers.push(newUser);

      credentialLines.push(
        `Name    : ${u.firstname} ${u.lastname}`,
        `Email   : ${u.Email}`,
        `Password: ${u.password}`,
        `Phone   : ${u.contact_number}`,
        `Role    : ${u.isAdmin ? "ADMIN" : "User"}`,
        `ID      : ${newUser._id}`,
        `---`,
      );

      console.log(
        `  ✓ ${u.firstname} ${u.lastname} [${u.isAdmin ? "ADMIN" : "User"}]`,
      );
    }

    // Insert items
    console.log("\n📦 Creating items...");
    const userIds = insertedUsers.map((u) => u._id);
    const itemDefs = buildItems(userIds);

    let inserted = 0;
    for (const item of itemDefs) {
      const newItem = new Items(item);
      await newItem.save();
      inserted++;
      console.log(
        `  ✓ [${item.itemcategory}] ${item.itemname} — ₹${item.itemprice}`,
      );
    }

    // Save credentials file
    const credContent = credentialLines.join("\n");
    console.log("\n📝 Credentials:\n" + credContent);

    console.log(
      `\n🎉 Done! ${insertedUsers.length} users, ${inserted} items seeded.`,
    );
    console.log(
      "\nSave the above credentials — also written to credentials.txt via npm run seed",
    );
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
