var express = require('express');
var {graphqlHTTP} = require('express-graphql');
var { graphql, buildSchema ,GraphQLScalarType } = require('graphql');
var app = express();
var http=require('http');

//实例化一个Date类型的标量,实现序列号和反序列化函数
var date=new GraphQLScalarType({
    name:'Date',
    description:'定义日期类型标量',
    parseValue(value){
        return new Date(value);
    },
    serialize(value){
        return value.getTime()
    },
})

//定义schema
var schema = buildSchema(`
        # 用户
        type User { 
            id:ID!
            name:String!
            sex:Sex!  
            createdAt:Date!
            updateAt:Date!
            roles:[Role]
        }

        type PrivatePan {
            id:ID!
            fileType:PanType!
            name:String!
            recentUseTime:Date!
            size:Int!
            creator:String!
            createAt:Date!
            updateAt:Date!
            readTimes:Int!
            downloadTimes:Int!
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

        # 枚举文件类型
        enum PanType{
            js
            excel
            png
            jpg
        }

        # 应用标量Date
        scalar Date

        # 所有查询的入口，定义查询方法 
        type Query {

            # 查询用户  
            getUser(id:ID!): User!

            # 查询用户私人网盘
            getUserPrivatePans(id:ID!):[PrivatePan!]

        }


`);
//Futures、Tasks 或者 Defferred
function httpRequestPromise(option){
    return new Promise((resolve, reject)=>{
        let request=http.request(option,function(req,res){
             let data='';
             req.on('data',function(chunk){
                 data+=chunk 
             });
             req.on('end',function(){
                 resolve(data);
             })
        })
        request.end();
    });
    
};

// 根节点为每个入口端点提供一个 resolver 函数
var resolver = { 

         getUser: async (args,request,info) => {
               let {id}=args;
               let response=await httpRequestPromise({
                    port:3000,
                    host:'127.0.0.1',
                    path:`/user/${id}`,
                    method:'GET'
                })
                return JSON.parse(response);
                
        },
        getUserPrivatePans:async (args,request,info) =>{
            let {id}=args;
            let response=await httpRequestPromise({
                 port:3001,
                 host:'127.0.0.1',
                 path:`/private-pan`,
                 method:'GET'
             })
             let list = JSON.parse(response);
             let dataArr=[];
             for(let i=0;i<list.length;i++){
                let {id}=list[i];
                let r=await httpRequestPromise({
                  port:3001,
                  host:'127.0.0.1',
                  path:`/private-pan/${id}`,
                  method:'GET'
              })
              dataArr.push(JSON.parse(r));
             }
             return dataArr;
        }
};


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