'use strict';

const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.ITEMS_DYNAMODB_TABLE;

module.exports.initializateDynamoClient = newDynamo => {
  dynamo = newDynamo;
};

module.exports.saveItem = item => {
  const params = {
    TableName: TABLE_NAME,
    Item: item
  };

  return dynamo.put(params).promise().then(() => {
    return item.itemId;
  });
};

module.exports.getItem = itemId => {
  const params = {
    Key: {
      itemId: itemId
    },
    TableName: TABLE_NAME
  };

  return dynamo.get(params).promise().then(result => {
    return result.Item;
  });
};

module.exports.deleteItem = itemId => {
  const params = {
    Key: {
      itemId: itemId
    },
    TableName: TABLE_NAME
  };

  return dynamo.delete(params).promise();
};



module.exports.updateItem = (itemId, listaParams) => {

  let paramsString='';
  let valuesObject={};
  let paramIndex=0;

  Object.keys(listaParams).forEach(k=>{

    paramIndex++;
    let p=':param'+paramIndex.toString();

    paramsString += paramsString===''?'':', ';
    paramsString +=`${k} = ${p}`;

    valuesObject[p]=listaParams[k];


  });

  paramsString='set ' + paramsString;


  const params = {
    TableName: TABLE_NAME,
    Key: {
      itemId
    },
    ConditionExpression: 'attribute_exists(itemId)',
    UpdateExpression:  paramsString,
    ExpressionAttributeValues: valuesObject,
    ReturnValues: 'ALL_NEW'
  };

  return dynamo.update(params).promise().then(response => {
    return response.Attributes;
  });
};
