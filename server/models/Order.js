import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from '../config/orderConstants.js';

const orderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    selectedSize: {
      type: String,
      default: null
    },
    selectedFlavor: {
      type: String,
      default: null
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    customizationNote: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(ORDER_STATUS)
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'An order must contain at least one item'
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Please enter a delivery address'],
      trim: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Please enter a contact number'],
      trim: true
    },
    note: {
      type: String,
      default: '',
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: [PAYMENT_METHOD.COD],
      default: PAYMENT_METHOD.COD,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.COLLECTED],
      default: PAYMENT_STATUS.PENDING,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      required: true,
      index: true
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: function () {
        return [{ status: ORDER_STATUS.PLACED, timestamp: new Date(), note: 'Order placed by buyer' }];
      }
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);
