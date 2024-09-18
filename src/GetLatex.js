function GetLatex(str){
    str=str.replaceAll("!","~").replaceAll("+","|").replaceAll("*","&").replaceAll("！","~").replaceAll("（","(").replaceAll("）",")")
    str=[...str]
    verify(str)
    const varibles=getVaribles(str)
    if(varibles.length==0){
      return undefined
    }
    const postfix=infix2postfix(str)
    console.log("POSTFIX:"+postfix)
    const astRoot=postfix2ast(postfix)
    const varibles_num=varibles.length
    let contexts=[]
    let recorder=[]
    for(let i=0;i<2**varibles_num;i++){
      let values=[...parseInt(i).toString(2)]
      var hashmap = new Map();
      for(let j=0;j<varibles_num;j++){
        hashmap[varibles[j]]=values[j]=='1'
      }
      contexts.push(hashmap)
    }
    const truthTable=astRoot.getTruthTable(contexts,0,recorder)
    recorder.sort(function(a,b){return b.layer-a.layer})

    let rows=[]
    let _a=varibles.map(c=>`\$${c}\$`)
    let _b=recorder.map(ele=>`\$${convert2latex(ele.infix)}\$`)
    let all=_a.concat(_b)
    rows.push(all)
    for(let i=0;i<contexts.length;i++){
      let a1=varibles.map(v=>`${contexts[i][v]?1:0}`)
      let a2=recorder.map(ele=>`${ele.table[i]?1:0}`)
      let all=a1.concat(a2)
      rows.push(all)
    }

    //const content= rows.join("\\\\ \n")+"\\\\"
    return {
      content:rows,
      columns:varibles_num+recorder.length
    }
}
function convert2latex(str){
  str=str.replaceAll("&"," \\land ").replaceAll("|"," \\lor ").replaceAll(">"," \\rightarrow ").replaceAll("="," \\leftrightarrow ").replaceAll("~"," \\sim ")
  return str
}
function verify(list){
  let stack=new Stack()
  for(const i of list){
    if(i=="("){
      stack.push(i)
    }else if(i==")"){
      if(stack.isEmpty()){
        throw new SyntaxError()
      }
      stack.pop()
    }
  }
  if(stack.isEmpty()){
    //ok
  }else{
    throw new SyntaxError()
  }
}
function getVaribles(list){
  let set=new Set();
  for(let j=0;j<list.length;j++){
    let i=list[j]
    if("A"<=i && i<="Z"){
      set.add(i)
    }
  }

  
  return [...set]
}
const prec={
  "(":1,
  ")":1,
  "=":1.5,
  ">":1.5,
  "|":2,
  "&":2,
  "~":4,
  "$":5
}
const operations={
  equal:"=",
  or:"|",
  and:"&",
  not:"~",
  if:">",
  immediate:"$"
};
function infix2postfix(exp){
    let op_stack =new Stack();
    let postfix=[];
    exp=[...exp]
    for (const element of exp) {
      if('A'<=element && element<='Z'){
        postfix.push(element)
      }else if(element=="("){
        op_stack.push(element)
      }else if(element==")"){
        let top=op_stack.pop()
        while(top!="("){
          postfix.push(top);
          top=op_stack.pop()
        }
      }else{
        while(!op_stack.isEmpty()&&prec[op_stack.peek()]>=prec[element]){
          postfix.push(op_stack.pop());
        }
        op_stack.push(element)
      }
    }
    while(!op_stack.isEmpty()){
      postfix.push(op_stack.pop());
    }
    return postfix

}
function postfix2ast(exp){
  const stack=new Stack()
  for (const element of exp){
    if('A'<=element && element<='Z'){
      stack.push(new AstNode(operations.immediate,element))
    }else if(element==operations.not){
      const ele=stack.pop()
      const ele_new=new AstNode(operations.not,ele)
      stack.push(ele_new)
    }else{
      const ele2=stack.pop();
      const ele1=stack.pop();
      const ele_new=new AstNode(element,ele1,ele2)
      stack.push(ele_new)
    }
  }
  const peek= stack.pop()
  if(stack.isEmpty()){
    return peek
  }else{
    throw new SyntaxError()
  }
}
class AstNode{
  constructor(op,ele1,ele2){
    this.op=op;
    this.ele1=ele1;
    this.ele2=ele2;
    this.infix=undefined;
  }
  getInfix(){
    if(this.infix!=undefined){
      return this.infix
    }
    if(this.op=="$"){//立即数
      this.infix=this.ele1
    }else{
      if(this.ele2==undefined){//单操作符
        if(prec[this.op]>prec[this.ele1.op]){
          this.infix=`${this.op}(${this.ele1.getInfix()})`
        }else{
          this.infix=`${this.op}${this.ele1.getInfix()}`
        }
      }else{//双操作符
        const left=prec[this.op]>prec[this.ele1.op]?`(${this.ele1.getInfix()})`:this.ele1.getInfix()
        const right=prec[this.op]>=prec[this.ele2.op]?`(${this.ele2.getInfix()})`:this.ele2.getInfix()
        this.infix=left+this.op+right
      }
    }
    return this.infix
  }
  getTruthTable(contexts,layer,recorder){
    if(this.op==operations.immediate){
      return contexts.map(e=>e[this.ele1])
    }
    const ele1_table=this.ele1.getTruthTable(contexts,layer+1,recorder)
    if(this.op==operations.not){ 
      let table=ele1_table.map(v=>!v)
      if(layer==0){
        recorder.push({
          layer:layer,
          infix:this.getInfix(),
          table:table
        })
      }
      return table
    }
    const ele2_table=this.ele2.getTruthTable(contexts,layer+1,recorder)
    let table=[]
    if(this.op==operations.and){
      for(let i=0;i<ele1_table.length;i++){
        table.push(ele1_table[i]&&ele2_table[i])
      }
    }else if(this.op==operations.or){
      for(let i=0;i<ele1_table.length;i++){
        table.push(ele1_table[i]||ele2_table[i])
      }
    }else if(this.op==operations.if){
      for(let i=0;i<ele1_table.length;i++){
        table.push(!ele1_table[i]||ele2_table[i])
      }
    }else if(this.op==operations.equal){
      for(let i=0;i<ele1_table.length;i++){
        table.push(ele1_table[i]==ele2_table[i])
      }
    }
    recorder.push({
      layer:layer,
      infix:this.getInfix(),
      table:table
    })
    return table
  }
}

class Stack {
  constructor() {
    this.items = []; // 使用数组存储栈内元素
  }

  // 入栈操作
  push(element) {
    this.items.push(element);
  }

  // 出栈操作
  pop() {
    if (this.isEmpty()) {
      return undefined; // 如果栈为空，则返回undefined
    }
    return this.items.pop();
  }

  // 查看栈顶元素
  peek() {
    if (this.isEmpty()) {
      return undefined; // 如果栈为空，则返回undefined
    }
    return this.items[this.items.length - 1];
  }

  // 检查栈是否为空
  isEmpty() {
    return this.items.length === 0;
  }

  // 清空栈
  clear() {
    this.items = [];
  }

  // 返回栈的大小
  size() {
    return this.items.length;
  }

  // 打印栈内元素
  print() {
    console.log(this.items.toString());
  }
}
export default GetLatex;
