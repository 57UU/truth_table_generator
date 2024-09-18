import { Button,Input,Card,Typography, Alert,message, Space,Row,Col,Modal }  from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { useState } from 'react';
import GetLatex from './GetLatex';
import "./App.css"
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import ReactDOMServer from 'react-dom/server'; 

const {  Text, Link } = Typography;
const horizon={ display: 'flex', justifyContent: 'space-between', width: '100%' }
const { Search } = Input;
function App() {
  const [expression,setExpresion]=useState("")
  const setDefault = (value, _e, info) => setExpresion("(P&Q)|R");
  const handleChange = (e) => {
    setExpresion(e.target.value);
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
        addonBefore="键入表达式"
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
${content.slice(1).map(i=>`| ${i.join(" | ")} |`).join("\n")}
`.trimStart();
  }
  return(<Row gutter={16}>
    <Col span={12}>
    {getLatexBlock(markdown,"Markdown")}
    {RenderBlock(content)}
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
      lastValue= GetLatex(str.toUpperCase())
      lastExpression=str
      return lastValue;
    }catch(err){
      return undefined;
    }
}
function getLatexBlock(c,title="Code"){
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
    <Text code>
        {c}
      </Text>
    </pre>
    </Card>

    </div>)
}
const wordExplain=()=>{
  alert("Word公式说明\n\n先将表格复制到Word里面\n选择表格，按下Alt+=\n在‘公式’选项卡中选择‘LaTeX’\n按下Ctrl+=渲染LaTeX公式")
}
function RenderBlock(content){
  let inner=errorMessage;
  const handleCopy = () => {
    try {
      // 获取表格 HTML
      const tableElement = document.getElementById('table1');
      if(tableElement==undefined) {
        message.warning(errorMessage)
        return
      }
      const t=(
        <table id="table1" align="center" valign="center" style={{ width: "100%",borderCollapse: "collapse",border:"1px solid black"}}>
          <thead>
            <tr>{content[0].map(e=><th style={{border:"1px solid black"}}>{e}</th>)}</tr>
          </thead>
          <tbody align="center" valign="center">
            {content.slice(1).map(i=><tr>{i.map(j=><td style={{border:"1px solid black",textAlign:"center"}}>{j}</td>)}</tr>)}
          </tbody>
        </table>)
      const tableHTML = ReactDOMServer.renderToStaticMarkup(t);
      navigator.clipboard.write([
          new ClipboardItem({
              'text/html': new Blob([tableHTML], { type: 'text/html' }),
              //'text/plain': new Blob([tableHTML], { type: 'text/plain' })
          })
      ]).then(
        ()=>{message.success('表格已复制到剪贴板！');}
      ).catch(
        err=>{message.error(`复制失败:${err}`);}
      );
    } catch (error) {
      message.error('复制失败，请重试！');
    }
  };
  if(content!=undefined){
    inner=(
    <table id="table1" align="center" valign="center" style={{ width: "100%",borderCollapse: "collapse",border:"1px solid black"}}>
      <thead>
        <tr>{content[0].map(e=><th style={{border:"1px solid black"}}><TeX block>{e.replaceAll("$","")}</TeX></th>)}</tr>
      </thead>
      <tbody align="center" valign="center">
        {content.slice(1).map(i=><tr>{i.map(j=><td style={{border:"1px solid black",textAlign:"center"}}>{j}</td>)}</tr>)}
      </tbody>
    </table>)
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  
  return(<Card title={
  <div style={horizon}>
    <div >Word Table(Beta)</div>
    <div >
      <Row gutter={16}>
        <Col span="12">
        <Button type='primary'  onClick={showModal} style={{width:100}}  size="middle">Note</Button>
        </Col>
        <Col span="12">
        <Button type='primary' id="word_copy" onClick={handleCopy} style={{width:100}}  size="middle">Copy</Button>
        </Col>
      </Row>
    </div>
  </div>
  }>
    {inner}
    <Modal title="Word公式说明" open={isModalOpen} onOk={handleOk} onCancel={handleOk} 
    footer={[
      <Button key="OK" type="primary"  onClick={handleOk}>
            OK
          </Button>,
    ]}>
        <p>先将表格复制到Word里面</p>
        <p>选择表格，按下<Text keyboard>Alt</Text> + <Text keyboard>=</Text>将其转换为公式</p>
        <p>在‘公式’选项卡中选择‘LaTeX’</p>
        <p>按下<Text keyboard>Ctrl</Text> + <Text keyboard>=</Text>渲染 <TeX>\LaTeX</TeX> 公式</p>
      </Modal>
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
      backgroundColor: '#1677ff', 
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
    backgroundColor: '#a0d911', // Ant Design的蓝色调
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
    fontSize: '2rem', // 你可以根据需要调整字体大小
    fontWeight: 'bold', // 加粗文字
    padding:"4rem 0",
    margin:"0 0 0 0.5rem",
  }}>
    {text}
  </div>
  <div style={{textAlign:"end",fontsize:'2rem',padding:"1rem 0"}}>
    <Link href="https://github.com/57UU/truth_table_generator" >
    <u className='githublink'>GitHub/Source Code</u>
    </Link>
    </div>
</div>

</Card>)
}

export default App;
