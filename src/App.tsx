import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./App.module.css";
import Table from "./components/Table";
import data from "./model/data";

function App() {
  return (
    <div className={styles.margin}>
      <h1> State Herkennen</h1>
      <Table products={data} />
    </div>
  );
}

export default App;
