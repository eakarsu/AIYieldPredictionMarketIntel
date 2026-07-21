const express=require('express');
const {sequelize,Sequelize}=require('../src/models');
const auth=require('../src/middleware/auth');
const {createWorkflow}=require('./workflowCore');
const {createGovernedRouter}=require('./routerFactory');
async function query(sql,params,transaction){return sequelize.query(sql,{bind:params,type:Sequelize.QueryTypes.SELECT,transaction});}
const db={query:(sql,params)=>query(sql,params),transaction:(work)=>sequelize.transaction((transaction)=>work((sql,params)=>query(sql,params,transaction)))};
module.exports=createGovernedRouter({express,workflow:createWorkflow(require('./config')),auth,db});
