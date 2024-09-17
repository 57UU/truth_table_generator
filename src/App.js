import { Button,Input,Card,Typography, Alert,message, Space,Row,Col }  from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { useState } from 'react';
import GetLatex from './GetLatex';
import "./App.css"


const horizon={ display: 'flex', justifyContent: 'space-between', width: '100%' }
const { Search } = Input;
function App() {
  const [expression,setExpresion]=useState("")
  const setDefault = (value, _e, info) => setExpresion("(P&Q)|R");
  const handleChange = (e) => {
    setExpresion(e.target.value.toUpperCase());
  };
  

  return (
    <div className="App" style={{width:"100%"}}>
      <Space direction="vertical" style={{width:"100%"}}> 
      <div style={horizon}>
        {getManual()}
        {getBanner("真值表计算器")}
      </div>
      
      <Alert 
        message="注意：在使用+或*运算符时，他们的优先级是相同的"
        type="info"
        showIcon
      />
      </Space>

      
      <div style={{padding:"1rem 1rem 1rem 1rem"}}>
      <Search
        style={{
          width: "100%",
        }}
        value={expression}
        onChange={handleChange}
        addonBefore="键入数学表达式"
        placeholder="input expression"
        allowClear
        onSearch={setDefault}
        enterButton="Try One"
        size="large"
      />
      {generateTable(handleExpression(expression))}
      </div>
    </div>
  );
}
function generateTable(c){
  let tableLatex;
  let content;
  if(c==undefined) {
    tableLatex="请输入或输入有误"
    content="请输入或输入有误"
  }else{
    content=c.content
    let contentList=content.split("\n")
tableLatex=String.raw`
\begin{table}[H]
    \centering
    \begin{tabular}{${"|c".repeat(c.columns)}|}
        \toprule[1.5pt]
        ${contentList[0]}
        \hline
${contentList.slice(1).map(i=>`        ${i}`).join("\n")}
        \bottomrule[1.5pt]
    \end{tabular}
\end{table}
`.trimStart()
  }
  return(<>
  {getLatexBlock(tableLatex,"带有表格的LaTeX Code")}
  </>
  )
}
let lastExpression=undefined;
let lastValue=undefined;
function handleExpression(str) {
    if(lastExpression==str){
      return lastValue;
    }
    try{
      lastValue= GetLatex(str)
      lastExpression=str
      return lastValue;
    }catch(err){
      return undefined;
    }
}
function getLatexBlock(c,title="LaTeX Code"){
  const copy=()=>{
    navigator.clipboard.writeText(c).then(() => {
      // 成功复制后，可以在这里添加一些反馈，比如弹窗或者状态消息
      message.success('代码已复制到剪贴板！');
    }).catch(err => {
      // 如果复制失败，可以在这里处理错误
      message.error('复制失败:', err);
    });
  }
  return(<div style={{padding:"1rem 0 0 0"}}>
    <div style={horizon}>
      <p>{title}</p>
      <Button type='primary' onClick={copy}>Copy</Button>
    </div>
    <pre>
    <code>
        {c}
      </code>
    </pre>
    </div>)
}
const manual=[
  '非：~ 或 !',
  "或：| 或 +",
  '与：& 或 *',
  '蕴含：> ',
  '等价：='
]


function getManual(){
  return (
    <Card title="说明" bordered={true}
     style={{ 
      width: 300 ,
      backgroundColor: 'green', // Ant Design的蓝色调
      fontSize: '1rem', 
      }}>
    <p>{manual.map(e=><div>{e}</div>)}</p>
  </Card>
  )
}
function getBanner(text){
  return ( <Card
  style={{
    width:"100%",
    textAlign: 'center',
    backgroundColor: '#1890ff', // Ant Design的蓝色调
    color: '#fff', // 白色文字
    fontSize: '2rem', // 你可以根据需要调整字体大小
    fontWeight: 'bold', // 加粗文字
    padding: '6rem 0', // 内边距调整
    margin:"0 0 0 0.5rem"
  }}
  bodyStyle={{ padding: 0 }} // 移除Card内部padding
>
  {text}
</Card>)
}

export default App;
