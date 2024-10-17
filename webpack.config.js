module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      express: require.resolve('express'),
      multer: require.resolve('multer'),
    },
  },
};
