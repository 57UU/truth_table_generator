import { Button,Input,Card,Typography, Alert,message, Space,Row,Col }  from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { useState } from 'react';
import GetLatex from './GetLatex';
import "./App.css"
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

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
const errorMessage="请输入或输入有误"
function generateTable(c){
  let tableLatex;
  let markdown;
  let content;
  if(c==undefined) {
    tableLatex=errorMessage
    markdown=errorMessage
  }else{
    content=c.content
tableLatex=String.raw`
\begin{table}[H]
    \centering
    \begin{tabular}{${"|c".repeat(c.columns)}|}
        \toprule[1.5pt]
        ${content[0].join(" & ")}
        \hline
${content.slice(1).map(i=>`        ${i.join(" & ")}`).join("\n")}
        \bottomrule[1.5pt]
    \end{tabular}
\end{table}
`.trimStart()
markdown=`
|${content[0].join(" | ")}|
${"|:---:".repeat(c.columns)}|
${content.slice(1).map(i=>`${i.join(" | ")}`).join("\n")}
`.trimStart();
  }
  return(<Row gutter={16}>
    <Col span={12}>
    {getLatexBlock(markdown,"Markdown")}
    {getRenderBlock(content)}
    </Col>
    <Col span={12}>
    {getLatexBlock(tableLatex,"LaTeX")}
    </Col>
    
  </Row>
  
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
    <Card style={{body:{ padding: 0 }}} title={
      <div style={horizon}>
        <div >{title}</div>
        <Button type='primary' style={{width:100}} onClick={copy} size="middle">Copy</Button>
      </div>
      }>
    <pre>
    <code>
        {c}
      </code>
    </pre>
    </Card>

    </div>)
}
function getRenderBlock(content){
  let inner=errorMessage;
  const handleCopy = async() => {
    try {
      // 获取表格 HTML
      const tableElement = document.getElementById('table1');
      const tableHTML = tableElement.outerHTML;

      // 将 HTML 和纯文本数据打包到 Blob 中
      const blob = new Blob([tableHTML], { type: 'text/html' });
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/html', tableHTML);
      dataTransfer.setData('text/plain', tableHTML); // 也可以提供纯文本版本

      await navigator.clipboard.write([
          new ClipboardItem({
              'text/html': blob,
              'text/plain': new Blob([tableHTML], { type: 'text/plain' })
          })
      ]);
      message.success('表格已复制到剪贴板！');
    } catch (error) {
        message.error('复制失败，请重试！');
    }
  };
  if(content!=undefined){
    inner=(<table id="table1" align="center" valign="center">
      <thead>
        <tr>{content[0].map(e=><th><TeX math={e.replaceAll("$","")} /></th>)}</tr>
      </thead>
      <tbody align="center" valign="center">
        {content.slice(1).map(i=><tr>{i.map(j=><td>{j}</td>)}</tr>)}
      </tbody>
    </table>)
  }
  return(<Card title={
  <div style={horizon}>
    <div >Word</div>
    <Button type='primary' style={{width:100}} onClick={handleCopy} size="middle">Copy</Button>
  </div>
  }>
    {inner}
  </Card>)
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
    <Card 
    title="说明"
     bordered={true}
     style={{ 
      width: 300 ,
      backgroundColor: 'green', // Ant Design的蓝色调
      fontSize: '1rem', 
      body:{ padding: 0 }, // 移除Card内部padding
      fontWeight: 'bold', // 加粗文字
      }}>
    <p>{manual.map(e=><div>{e}</div>)}</p>
  </Card>
  )
}
function getBanner(text){
  return ( <Card
  style={{
    width:"100%",
    backgroundColor: '#1890ff', // Ant Design的蓝色调
    color: '#fff', // 白色文字
    margin:"0 0 0 0.5rem",
    body:{ padding: 0 } // 移除Card内部padding
  }}
><div style={{height:"13rem",textAlign:"center",}}>
  <div style={{
    textAlign: 'center',
    display:"flex",
    justifyContent:"center",
    alignItems: 'center',
    color: '#fff', // 白色文字
    fontSize: '2rem', // 你可以根据需要调整字体大小
    fontWeight: 'bold', // 加粗文字
    padding:"4rem 0",
    margin:"0 0 0 0.5rem",
  }}>
    {text}
  </div>
  <div style={{textAlign:"end",fontsize:'2rem',padding:"1rem 0"}}>
    <a href="https://github.com/57UU/truth_table_generator" style={{color:"white",fontsize:"2rem"}}>
    <div style={{color:"white",fontsize:"2rem"}}><u>GitHub/Source Code</u></div>
    </a>
    </div>
</div>

</Card>)
}

export default App;
