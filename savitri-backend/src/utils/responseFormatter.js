const mongoose = require('mongoose');

/**
 * Check if a value is a Mongoose/BSON ObjectId
 */
const isObjectId = (val) => {
  try {
    return (
      val instanceof mongoose.Types.ObjectId ||
      (val && val._bsontype === 'ObjectID') ||
      (val && val._bsontype === 'ObjectId')
    );
  } catch {
    return false;
  }
};

/**
 * Check if a value is a plain object (not Date, Buffer, ObjectId, etc.)
 */
const isPlainObject = (val) => {
  if (!val || typeof val !== 'object') return false;
  try {
    const proto = Object.getPrototypeOf(val);
    return proto === Object.prototype || proto === null;
  } catch {
    return false;
  }
};

/**
 * Recursively sanitize a value, converting ObjectIds to strings
 * and cleaning _id → id, removing __v
 */
const sanitizeValue = (val) => {
  if (val == null) return val;
  if (isObjectId(val)) return val.toString();
  if (val instanceof Date) return val;
  if (Buffer.isBuffer(val)) return val;
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (isPlainObject(val)) {
    const result = {};
    for (const key of Object.keys(val)) {
      if (key === '__v') continue;
      if (key === '_id') {
        try {
          result.id = val._id.toString();
        } catch {
          result.id = String(val._id);
        }
      } else {
        result[key] = sanitizeValue(val[key]);
      }
    }
    return result;
  }
  return val;
};

const formatDocument = (doc) => {
  if (!doc) return null;
  try {
    const obj = doc.toObject ? doc.toObject() : doc;
    return sanitizeValue(obj);
  } catch {
    // Fallback: try JSON round-trip to get a clean plain object
    try {
      return JSON.parse(JSON.stringify(doc));
    } catch {
      return doc;
    }
  }
};

const formatDocuments = (docs) => {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => formatDocument(doc));
};

const formatPaginatedResponse = (docs, pagination) => {
  return {
    data: formatDocuments(docs),
    pagination,
  };
};

module.exports = {
  formatDocument,
  formatDocuments,
  formatPaginatedResponse,
};
