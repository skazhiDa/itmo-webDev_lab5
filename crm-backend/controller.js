const { Client } = require('./model');
const apiErrors = require('./ApiErrors');
const { DataTypes, where } = require("sequelize");

class Controller {
  async getClient(req, res, next) {
    const { id } = req.query;
    if (!id) return next(apiErrors.badRequest('no id received'));
    const client = await Client.findOne(
      {
        where: {id},
      }
    );
    return res.json(client);
  };

  async getClients(req, res) {
    const clients = await Client.findAll();
    return res.json(clients);
  };

  async postClient(req, res) {
    const { name, surname, lastName, contacts } = req.body;
    const id = Date.now().toString().substring(6, 13);
    const client = await Client.create({ id, name, surname, lastName, contacts })
    return res.json(client);
  };

  async patchClient(req, res) {
    const {id} = req.query;
    const {name, surname, lastName, contacts} = req.body;
    const client = await Client
      .findOne(
        {
          where: {id},
        }
      ).then((record) => {
        return record.update(
          {
            name: name,
            lastName: lastName,
            surname: surname,
            contacts: contacts,
          }
        )
      });
    return res.json(client);
  };

  async deleteClient(req, res) {
    const {id} = req.query;
    const result = await Client.destroy({ where: {id} });
    return res.json(result);
  };
}

module.exports = new Controller();
