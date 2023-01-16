module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("users", "customPath", {
        type: Sequelize.STRING(191),
        defaultValue: "/"
      })
    ])
  }
}