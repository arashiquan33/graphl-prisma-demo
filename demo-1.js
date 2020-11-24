//npm install graphql

var { graphql, buildSchema ,GraphQLScalarType } = require('graphql');

//实例化一个Date类型的标量,实现序列号和反序列化函数
new GraphQLScalarType({
    name:'Date',
    description:'定义日期类型标量',
    parseValue(value){
        return new Date(value);
    },
    serialize(value){
        return value.getTime()
    },
})

// 使用 GraphQL schema language 构建一个 schema
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
        getUsers: () => {
                 return usersData
        },
        getUserByName:({name})=>{
                 let user= usersData.find(u=>u.name==name);
                 return user;
        },
        addUser:({data})=>{
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

// 客户端进行查询
// 运行 GraphQL query '{ users }' ，查询所有用户,并且指定返回字段
/*：1.客户端可以指定返回的字段,可进行嵌套
    2.可以联合发起最多查询
    3.查询可以带参数
*/
let usersQuery = `
        query QueryOperation  {
                    getUsers{
                        id
                        name
                        sex
                    }
                    getUserByName(name:"包秀"){
                        id
                        name
                        sex
                        roles
                    }  
           }
`
//graphql(schema, usersQuery, resolver).then((response) => {console.log(JSON.stringify(response, null, 4));})

// 运行 GraphQL mutation 新增用户,并且指定返回字段
/*：1.客户端可以指定返回的字段,可进行嵌套
    3.查询可以带参数
*/

let userMutation = `
      mutation MutationOperation {
                   addUser(data:{name:"尚浩",sex:Man,roles:[Admin,System]}){
                        id
                        name
                        sex
                        createdAt
                        updateAt
                        roles
                   }
           }

`

graphql(schema, userMutation, resolver).then((response) => {console.log(JSON.stringify(response, null, 4));})