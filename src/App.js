import React from 'react'
import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import {utils} from 'ethers';

import 'react-data-grid/lib/styles.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockTransactions, setBlockTransactions] = useState([]);
  const [transactionSelected, setTransactionSelected] = useState("");

  // To kick things off, get the block number
  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }

    getBlockNumber();
  },[]);

  // Then use the block number to grab some useful info (i.e. transactions)
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

  // When a transaction is click/selected setTransactionSelected with it
  const handleSelectTransaction = (hash) => {
    if(blockTransactions.length === 0) setTransactionSelected('')

    setTransactionSelected(hash)
  }

  // Calculate the gas fee use the gasLimit and gasPrice
  const calcFee = (transaction, toFixed) => {
    const gasFee = transaction.gasLimit * transaction.gasPrice

    if(gasFee.toString() === "NaN") return "0";
    
    return parseFloat(utils.formatEther(gasFee.toString())).toFixed(toFixed)
  }

  // Go to the earlier block
  const previousBlock = () => {
    const actualBlocknumber = blockNumber - 1 < 0 ? 0 : blockNumber - 1 
    setBlockNumber(actualBlocknumber)
  }

  // Go to the later block
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

  // Header and Navigation
  const Block = () => {
    return (
      <>
            <nav className="navbar">
                <div className="">
                    <h1 href="#">Block Explorer</h1>
                    <div class="btn-group">
                        <button type="button" className="btn btn-link">{` Block Number: ${blockNumber} `}</button>
                        <button type="button" className="btn btn-primary" onClick={() => previousBlock()}>Earlier Block</button>
                        <button type="button" className="btn btn-primary" onClick={() => nextBlock()}>Later Block</button>
                    </div>
                </div>
            </nav>
      </>
    );
  }

  // Transactions Table
  const Transactions = () => {
    return (
      <>
        <div className="col" style={{
            width: "60%",
        }}>
          <table className='table table-condensed'>
            <thead className='thead-dark'>
              <tr>
                <th>Transaction Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {blockTransactions.map(transaction => {
                return (
                  <tr key={transaction.hash} onClick={() => handleSelectTransaction(transaction.hash)}>
                    <th >{getSubstring(transaction.hash, 15)}</th>
                    <th>{getSubstring(transaction.from, 15)}</th>
                    <th>{getSubstring(transaction.to, 15)}</th>
                    <th>{parseFloat(utils.formatEther(transaction.value.toString())).toFixed(12)}</th>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // Detail instances rendered into larger TransactionDetail component below
  const Detail = (props) => {
    return (
      <div>
        <p style={{marginLeft: 10, marginRight: 10, fontWeight: "bold"}}>{props.name}:</p>
        <p>{props.value}</p>
      </div>
    )
  }

  // The actual TransactionDetail media card rendered with additional transaction details
  const TransactionDetail = (props) => {
    return (
    <>
        <div className="media border p-3 col" style={{
            width: "40%",
        }}>
            <h3>{"Selected Transaction"}</h3>
            <hr></hr>
        <div className="media-body">
            <Detail name={"Transaction Hash"} value={props.transaction.hash}/>
            <Detail name={"Block"} value={props.transaction.blockNumber}/>
            <Detail name={"From"} value={props.transaction.from}/>
            <Detail name={"To"} value={props.transaction.to}/>
            <Detail name={"Confirmations"} value={props.transaction.confirmations}/>
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
      <div className='row'  style={{
        fontSize: 14,
      }}>
      <Transactions />
      <TransactionDetail transaction={getTransaction(transactionSelected)}/>
      </div>
    </>
  );
}

export default App;