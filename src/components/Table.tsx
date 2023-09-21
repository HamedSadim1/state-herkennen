import React, { useState, Fragment, FC } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ProductTable from "react-bootstrap/Table";

interface Item {
  name: string;
  price: number;
  inStock: boolean;
}

interface TableHeadName {
  products: Item[];
}
const Table: FC<TableHeadName> = ({ products }) => {
  const [productName, setProductName] = useState<string>();
  const [price, setPrice] = useState<number>();
  const [inStock, setInStock] = useState<boolean>();
  const [product, setProduct] = useState(products);

  // const handleProductName:
  // React.ChangeEventHandler<FormControlElement> undefined = (event) => {
  //   setProductName(event.target.value);
  // };
  return (
    <Fragment>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicText">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Product Name"
            //onChange={handleProductName}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicNumber">
          <Form.Label>Price</Form.Label>
          <Form.Control type="number" placeholder="Price" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="inStock" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>

      <ProductTable striped bordered hover>
        <thead>
          <tr>
            <th>Product Name</th>
            <th> Price </th>
            <th>in Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item: Item) => (
            <tr>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td style={{ color: item.inStock ? "yes" : "no" }}>
                {item.inStock ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </ProductTable>
    </Fragment>
  );
};

export default Table;
