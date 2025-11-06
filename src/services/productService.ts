import { Product } from '../types';

// A static list of fallback products in case the API fails
const getFallbackProducts = (): Omit<Product, 'id'>[] => [
    {
      name: 'Classic White T-Shirt',
      description: 'A timeless classic, perfect for any occasion. Made from 100% premium cotton for ultimate comfort.',
      price: 29.99,
      category: 'Men',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/10/02/22/17/white-t-shirt-1710578_640.png',
    },
    {
      name: 'Slim-Fit Denim Jeans',
      description: 'Modern slim-fit jeans designed for a sleek and stylish look. Crafted from stretch-denim for all-day comfort.',
      price: 89.99,
      category: 'Men',
      imageUrl: 'https://cdn.pixabay.com/photo/2021/08/01/08/33/jeans-6513571_640.jpg',
    },
    {
      name: 'Floral Print Midi Dress',
      description: 'An elegant midi dress with a vibrant floral print. Perfect for summer parties and weekend outings.',
      price: 129.99,
      category: 'Women',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/08/21/14/33/model-4421113_640.jpg',
    },
    {
      name: 'Leather Crossbody Bag',
      description: 'A chic and versatile crossbody bag made from genuine leather. Features multiple compartments for your essentials.',
      price: 149.99,
      category: 'Accessories',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/09/26/14/06/handbag-1695123_640.jpg',
    },
     {
      name: 'Vintage Leather Jacket',
      description: 'A classic biker-style jacket made from high-quality faux leather, with a timeless vintage finish.',
      price: 199.99,
      category: 'Men',
      imageUrl: 'https://cdn.pixabay.com/photo/2017/01/23/18/25/motorcycle-jacket-2003240_640.jpg'
    },
    {
        name: 'Cozy Knit Sweater',
        description: 'A warm and cozy knit sweater for chilly days. Made with a soft wool blend.',
        price: 79.99,
        category: 'Women',
        imageUrl: 'https://cdn.pixabay.com/photo/2017/08/01/11/42/people-2564617_640.jpg'
    },
    {
        name: 'Stylish Sunglasses',
        description: 'Protect your eyes with these fashionable UV-protection sunglasses.',
        price: 49.99,
        category: 'Accessories',
        imageUrl: 'https://cdn.pixabay.com/photo/2015/06/22/08/37/sunglasses-817237_640.jpg'
    }
  ];

/**
 * This function is intended to seed the database with initial product data.
 * It returns a list of product data objects that can be added to Firestore.
 * NOTE: This function does NOT interact with the database directly.
 */
export const getInitialProducts = (): Omit<Product, 'id'>[] => {
  // In a real-world scenario, you might fetch this from an API.
  // For this project, we'll use the static fallback data.
  return getFallbackProducts();
};
