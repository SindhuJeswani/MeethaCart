import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Bakery item title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1200, 'Description cannot exceed 1200 characters']
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1 PKR']
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    images: {
      type: [String],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'At least one item image is required'
      }
    },
    isEggless: {
      type: Boolean,
      default: false
    },
    preparationTimeHours: {
      type: Number,
      default: 24,
      min: [1, 'Preparation time must be at least 1 hour']
    }
  },
  {
    timestamps: true
  }
);

// Text index for keyword search in M3
itemSchema.index({ title: 'text', description: 'text' });

export const Item = mongoose.model('Item', itemSchema);
