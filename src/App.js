import React from 'react'
import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import {utils} from 'ethers';

import 'react-data-grid/lib/styles.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockTransactions, setBlockTransactions] = useState([]);
  const [transactionSelected, setTransactionSelected] = useState("");

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }

    getBlockNumber();
  },[]);

  useEffect(() => {
    async function setTransactions() {
      try {
        const { transactions } = await alchemy.core.getBlockWithTransactions(blockNumber)
      
        setBlockTransactions(transactions);
      } catch (error) {
        setBlockTransactions([]);
      }
    }

    setTransactions();
  },[blockNumber]);

  const handleSelectTransaction = (hash) => {
    if(blockTransactions.length === 0) setTransactionSelected('')

    setTransactionSelected(hash)
  }

  const calcFee = (transaction, toFixed) => {
    const gasFee = transaction.gasLimit * transaction.gasPrice

    if(gasFee.toString() === "NaN") return "0";
    
    return parseFloat(utils.formatEther(gasFee.toString())).toFixed(toFixed)
  }

  const previousBlock = () => {
    const actualBlocknumber = blockNumber - 1 < 0 ? 0 : blockNumber - 1 
    setBlockNumber(actualBlocknumber)
  }

  const nextBlock = () => {
    const actualBlocknumber = blockNumber + 1 
    setBlockNumber(actualBlocknumber)
  }

  const getSubstring = (data, index) => {
    try {
      return `${data.substring(0,index)}...`
    } catch (error) {
      return ''
    }
  }

  const getTransaction = (hash) => {
    const transactions = [...blockTransactions];
    const index = transactions.findIndex(tx => tx.hash === hash)
    if(index >= 0) return transactions[index];

    return {};
  }

  const Block = () => {
    return (
      <>
            <nav className="navbar">
                <div className="">
                    <h1 href="#">Block Explorer</h1>
                    <div class="btn-group">
                        <button type="button" className="btn btn-link">{` Block Number: ${blockNumber} `}</button>
                        <button type="button" className="btn btn-primary" onClick={() => previousBlock()}>Previous Block</button>
                        <button type="button" className="btn btn-primary" onClick={() => nextBlock()}>Next Block</button>
                    </div>
                </div>
            </nav>
      </>
    );
  }

  const Transactions = () => {
    return (
      <>
        <div className="container" style={{
          overflow: "auto",
          maxHeight: "20rem",
          cursor: "pointer"
        }}>
          <table className='table table-striped table-condensed'>
            <thead>
              <tr>
                <th>Transaction Hash</th>
                {/* <th>Block</th> */}
                <th>From</th>
                <th>To</th>
                {/* <th>Confirmations</th> */}
                <th>Value</th>
                <th>Transaction Fee</th>
                {/* <th>Data</th> */}
              </tr>
            </thead>
            <tbody>
              {blockTransactions.map(transaction => {
                return (
                  <tr key={transaction.hash} onClick={() => handleSelectTransaction(transaction.hash)}>
                    <th >{getSubstring(transaction.hash, 15)}</th>
                    {/* <th>{transaction.blockNumber}</th> */}
                    <th>{getSubstring(transaction.from, 15)}</th>
                    <th>{getSubstring(transaction.to, 15)}</th>
                    {/* <th>{transaction.confirmations}</th> */}
                    <th>{parseFloat(utils.formatEther(transaction.value.toString())).toFixed(12)}</th>
                    <th>{calcFee(transaction, 5)}</th>
                    {/* <th>{getSubstring(transaction.data,15)}</th> */}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  const Detail = (props) => {
    return (
      <div style={{
        display:"flex", 
        flexDirection: "row",
        justifyContent:"flex-start", 
        marginLeft: 24, 
        fontSize: 14,
      }}>
        <p style={{marginLeft: 10, marginRight: 10, fontWeight: "bold"}}>{props.name}:</p>
        <p>{props.value}</p>
      </div>
    )
  }

  const TransactionDetail = (props) => {
    return (
    <>
        <div className="container media border p-3">
            <b>{"Transaction Hash"}</b>
            <hr></hr>
        <div className="media-body">
            <Detail name={"Transaction Hash"} value={props.transaction.hash}/>
            <Detail name={"Block"} value={props.transaction.blockNumber}/>
            <Detail name={"From"} value={props.transaction.from}/>
            <Detail name={"To"} value={props.transaction.to}/>
            <Detail name={"Confirmations"} value={props.transaction.confirmations}/>
            {/* <Detail name={"value"} value={props.transaction.value}/> */}
            <Detail name={"Transaction Fee"} value={calcFee(props.transaction, 18)}/>
            <Detail name={"Data"} value={props.transaction.data} />
        </div>
        </div>
    </>
    )
  }

  return (
    <>
      <Block />
      <Transactions />
      <TransactionDetail transaction={getTransaction(transactionSelected)}/>
    </>
  );
}

export default App;