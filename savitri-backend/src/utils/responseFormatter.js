const formatDocument = (doc) => {
  if (!doc) return null;
  
  const formatted = doc.toObject ? doc.toObject() : doc;
  
  if (formatted._id) {
    formatted.id = formatted._id.toString();
    delete formatted._id;
  }
  
  delete formatted.__v;
  
  Object.keys(formatted).forEach(key => {
    if (formatted[key] && typeof formatted[key] === 'object') {
      if (formatted[key]._id) {
        formatted[key].id = formatted[key]._id.toString();
        delete formatted[key]._id;
      }
    }
  });
  
  return formatted;
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
