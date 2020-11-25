//npm install express express-graphql

var express = require('express');
var {graphqlHTTP} = require('express-graphql');
var { graphql, buildSchema ,GraphQLScalarType } = require('graphql');

//实例化一个Date类型的标量,实现序列号和反序列化函数
var aa=new GraphQLScalarType({
    name:'Date',
    description:'定义日期类型标量',
    parseValue(value){
        return new Date(value);
    },
    serialize(value){
        return value.getTime()
    },
})


var schema = buildSchema(`
        # 用户
        type User { 
        id:ID!
        name:String!
        sex:Sex!  
        createdAt:Date!
        updateAt:Date!
        roles:[Role]!
        }

        # 新增用户时输入参数对象结构
        input AddUserInput {
        name:String!
        sex:Sex!  
        roles:[Role]!
        }


        # 枚举性别
        enum Sex {
            Man
            Woman
        }

        # 枚举角色
        enum Role{
            Admin
            System
            Normal
        }

        # 应用标量Date
        scalar Date

        # 所有查询的入口，定义查询方法 
        type Query {

            # 查询所有用户  
            getUsers: [User!]

            # 根据name查询某个用户
            getUserByName(name:String!):User!
        }

        # 所有修改的入口，定义修改方法
        type Mutation {

            # 新增用户
            addUser(data:AddUserInput):User!

        }

`);

// 根节点为每个入口端点提供一个 resolver 函数
var resolver = { 

    getUsers: (args,request,info) => {
             return usersData
    },
    getUserByName:({name},request,info)=>{
             let user= usersData.find(u=>u.name==name);
             return user;
    },
    addUser:({data},request,info)=>{
        let {sex,roles,name} = data;
        let newUser = {
             id:`184793`,
             name,
             sex,
             roles,
             createdAt:new Date().toISOString(),
             updateAt:new Date().toISOString()
        }
        return newUser;
    } 

};

var usersData=[{
    id:'15678787878',
    name:'权田超',
    sex:'Man',
    createdAt:'2020-12-12 12:12:12',
    updateAt:'2020-12-12 12:12:12',
    roles:['Admin']
},{
    id:'135484784787',
    name:'包秀',
    sex:'Woman',
    createdAt:'2020-12-12 12:12:12',
    updateAt:'2020-12-12 12:12:12',
    roles:['Admin']
}];


var app = express();

//定义endpoint，接收客户端发送的body体，通过graphql方法查询数据返回
// app.use('/graphql',function(req,res){
//     let postBody=''
//     req.on('data',function(chunk){
//         postBody+=chunk;
//     })
//     req.on('end',function(){
//         console.log(postBody);
//         let o=JSON.parse(postBody);
//         let queryStr=`${Object.values(o)[0]}`;
//         console.log(queryStr);
//         graphql(schema, queryStr, resolver).then((response) => {
//             console.log(JSON.stringify(response, null, 4));
//             res.send(response);
//         })
//     })
// })

//  app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

//express提供了graphqlHTTP middleaware
const loggMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] : ${req.url} : ${req.ip}`);
    next();
}
app.use(loggMiddleware);
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolver,
  graphiql: true
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

//1.CURL命令发送POST,参数采用grapqhl查询语法
//curl -X POST -H "Content-Type:application/json" -d '{"query":"{getUsers{\n id\n  name\n sex\n}}"}' http://localhost:4000/graphql 
//curl -X POST -H "Content-Type:application/json" -d '{"query":"{getUserByName(name:\"包秀\"){ id name sex}}"}' http://localhost:4000/graphql 
//2.graphiql界面查询
// 3.http查询
// fetch('/graphql', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//     },
//     body: JSON.stringify({query: "{ getUsers{id name sex} }"})
//   })
//     .then(r => r.json())
//     .then(data => console.log('data returned:', data))
//4.request,info,args,middleaware
