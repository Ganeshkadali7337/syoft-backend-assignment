const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const userData = require("./UserDataModel");
const productData = require("./ProductModel");
const Authenticate = require("./AuthenticateMiddleware");

app.use(cors());

app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => console.log("server running..."));

mongoose
  .connect("mongodb+srv://ganesh:ganesh@cluster7337.7exrzd7.mongodb.net/")
  .then(() => console.log("db connected..."));

app.post("/register", async (req, res) => {
  const { userName, email, password, role } = req.body;

  try {
    if (!userName || !email || !password || !role) {
      return res.status(400).send({
        status: 400,
        msg: "all fields are required {username, email, password, role}",
      });
    }

    if (!email.includes("@")) {
      return res
        .status(400)
        .send({ status: 400, msg: "please provide valid email" });
    }

    const existed = await userData.findOne({ email });
    const validRoles = ["admin", "manager", "staff"];

    if (existed) {
      return res.status(400).send({ status: 400, msg: "user already existed" });
    }

    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).send({
        status: 400,
        msg: "please enter a valid role (admin, manager, staff)",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userData({
      userName,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
    });
    await newUser.save();
    res.status(201).send({ status: 201, msg: "user registered successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).send({
        status: 400,
        msg: "all fields are required {email, password}",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).send({ status: 400, msg: "provide valid email" });
    }

    const existed = await userData.findOne({ email });
    if (!existed) {
      return res.status(400).send({ status: 400, msg: "user not exist" });
    } else {
      const passwordMatch = await bcrypt.compare(password, existed.password);
      if (!passwordMatch) {
        return res
          .status(400)
          .send({ status: 400, msg: "password did not match" });
      } else {
        let payload = {
          id: existed.id,
          role: existed.role,
        };
        let token = jwt.sign(payload, "user");
        res.status(200).send({
          status: 200,
          msg: "login successfull",
          token,
          role: existed.role,
        });
      }
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

app.post("/create-product", Authenticate, async (req, res) => {
  const { role } = req;
  const { title, description, inventoryCount } = req.body;

  try {
    if (role !== "admin") {
      res
        .status(400)
        .send({ status: 400, msg: "only admins can create product" });
    }
    if (!title || !description || !inventoryCount) {
      return res.status(400).send({
        status: 400,
        msg: "all fields are required {title, description, inventoryCount}",
      });
    }

    if (isNaN(inventoryCount)) {
      return res.status(400).send({
        status: 400,
        msg: "inventory count must contain integer value",
      });
    }

    const newProduct = new productData({
      title,
      description,
      inventoryCount: parseInt(inventoryCount),
    });
    await newProduct.save();
    res.status(200).send({
      status: 200,
      msg: "product created successfully",
      product: { title, description, inventoryCount },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

app.get("/products", Authenticate, async (req, res) => {
  const { role } = req;

  try {
    const hasAccess = ["admin", "manager"];
    if (!hasAccess.includes(role)) {
      return res.status(400).send({
        status: 400,
        msg: "only admins and managers have access for products",
      });
    }
    const allProducts = await productData.find();
    res.status(200).send({ status: 200, products: allProducts });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

app.get("/products/:id", Authenticate, async (req, res) => {
  const { id } = req.params;
  const { role } = req;
  try {
    const hasAccess = ["admin", "manager"];
    if (!hasAccess.includes(role)) {
      return res.status(400).send({
        status: 400,
        msg: "only admins and managers have access for products",
      });
    }
    const product = await productData.findOne({ _id: id });
    res.status(200).send({ status: 200, product });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

app.put("/update-product/:id", Authenticate, async (req, res) => {
  const { id } = req.params;
  const { role } = req;
  const { title, description, inventoryCount } = req.body;

  try {
    const hasAccess = ["admin", "manager"];

    if (!hasAccess.includes(role)) {
      return res.status(400).send({
        status: 400,
        msg: "only admins and managers have access for update products",
      });
    }

    const updateProduct = {};

    if (title) {
      updateProduct.title = title;
    }

    if (description) {
      updateProduct.description = description;
    }

    if (inventoryCount) {
      if (isNaN(inventoryCount)) {
        return res.status(400).send({
          status: 400,
          msg: "inventory count must contain integer value",
        });
      }
      updateProduct.inventoryCount = parseInt(inventoryCount);
    }

    const updatedProduct = await productData.findByIdAndUpdate(
      id,
      updateProduct,
      { new: true }
    );

    if (!updateProduct) {
      return res.status(400).send({
        status: 400,
        msg: "product not found",
      });
    }

    res.status(200).send({
      status: 200,
      msg: "product updated successfully",
      updatedProduct,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

app.delete("/delete-product/:id", Authenticate, async (req, res) => {
  const { id } = req.params;
  const { role } = req;
  try {
    const hasAccess = ["admin"];
    if (!hasAccess.includes(role)) {
      return res.status(400).send({
        status: 400,
        msg: "only admins have access for deleting products",
      });
    }
    const deleteProduct = await productData.findByIdAndDelete({ _id: id });

    if (!deleteProduct) {
      return res.status(400).send({
        status: 400,
        msg: "product not found",
      });
    }

    res.status(200).send({ status: 200, msg: "product deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});
