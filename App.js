import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableHighlight } from 'react-native';
import Dimensions from 'Dimensions';

const defaultData = {
  totalTime: '00:00:00',
  initialTime: 0, //首次计时时间
  timeAccumulation: 0, //保存暂停的时间长
  defaultRecordLength: 8, // 默认记录次数
  curRecordIndex: 0,
  records: [{
    id: '',
    time: ''
  }, {
    id: '',
    time: ''
  }, {
    id: '',
    time: ''
  }, {
    id: '',
    time: ''
  }, {
    id: '',
    time: ''
  }, {
    id: '',
    time: ''
  }, {
    id: '',
    time: ''
  }, {
    id: '',
    time: ''
  }]
}

export default class TimeWatch extends Component {
  constructor (props) {
    super(props)
    this.state = defaultData
  }

  _clearRecord () {
    this.setState(defaultData)
  }

  _startRecord () {
    const initialTime = (new Date()).getTime()
    this.timer = setInterval(() => {
      const currentTime = (new Date()).getTime()
      const timeDiff = currentTime - initialTime + this.state.timeAccumulation;
      let minute = Math.floor(timeDiff / (60 * 1000));
      let second = Math.floor((timeDiff - 60000 * minute) / 1000);
      let milSecond = Math.floor((timeDiff % 1000) / 10);
      this.setState({
        initialTime,
        totalTime: (minute < 10 ? `0${minute}` : minute) + ":" + (second < 10 ? `0${second}` : second) + "."+(milSecond < 10? `0${milSecond}` : milSecond)
      })
    }, 300)
  }

  _stopRecord () {
    clearInterval(this.timer)
    const {timeAccumulation, initialTime} = this.state;
    const currentTime = (new Date()).getTime();
    this.setState({
      timeAccumulation: currentTime - initialTime + timeAccumulation
    })
  }

  _addRecord () {
    let {curRecordIndex, defaultRecordLength, records, totalTime} = this.state;
    records = [...records];
    if (curRecordIndex <= defaultRecordLength) {
      records.splice(curRecordIndex, 1, {
        id: curRecordIndex + 1,
        time: totalTime
      })
    } else {
      records.push({
        id: curRecordIndex + 1,
        time: totalTime
      })
    }
    this.setState({
      records,
      curRecordIndex: curRecordIndex + 1
    })
  }

  render () {
    return (
      <View style={styles.containPage}>
        <WatchView totalTime={this.state.totalTime}/>
        <WatchAction
          startRecord = {() => this._startRecord()}
          stopRecord = {() => this._stopRecord()} 
          addRecord = {() => this._addRecord()}
          clearRecord = {() => this._clearRecord()}
        />
        <WatchRecord records={this.state.records} defaultRecordLength={this.state.defaultRecordLength}/>
      </View>
    )
  }
}

class WatchView extends Component{
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <View style={styles.watchView}>
        <Text style={styles.watchViewText}>{this.props.totalTime}</Text>
      </View>
    )
  }
}

class WatchAction extends Component{
  constructor (props) {
    super(props)
    this.state = {
      underlayColor: '#CCC',
      rightBtnName: '启动',
      leftBtnName: '计次',
      curStatus: 'unStart'
    }
    this._startOrStop = this._startOrStop.bind(this)
    this._recordOrClear = this._recordOrClear.bind(this)
  }

  _recordOrClear () {
    const {curStatus} = this.state;
    if (curStatus === 'unStart') {
      return
    } else if (curStatus === 'watching') {
      // 计时中 -- 计次操作
      this.props.addRecord()
    } else if (curStatus === 'stoped') {
      // 暂停中 -- 复位(清空)操作
      this.props.clearRecord()
      this.setState({
        curStatus: 'unStart',
        rightBtnName: '启动',
        leftBtnName: '计次'
      })
    }
  }

  _startOrStop () {
    const {curStatus} = this.state;
    if (curStatus === 'unStart' || curStatus === 'stoped') {
      // 初始化 第一次计时
      this.setState({
        rightBtnName: '暂停',
        curStatus: 'watching',
        leftBtnName: '计次'
      })
      this.props.startRecord()
    } else {
      // 暂停
      this.setState({
        rightBtnName: '启动',
        curStatus: 'stoped',
        leftBtnName: '复位'
      })
      this.props.stopRecord()
    }
  }

  render () {
    const {rightBtnName, leftBtnName} = this.state;
    return (
      <View style={styles.watchAction}>
        <View style={[styles.leftBtn]}>
          <TouchableHighlight style={styles.actionBtn} onPress={() => this._recordOrClear()} underlayColor={this.state.underlayColor}>
            <Text style={styles.btnText}>{leftBtnName}</Text>
          </TouchableHighlight>
        </View>
        <View style={[styles.rightBtn]}>
          <TouchableHighlight style={styles.actionBtn} onPress={() => this._startOrStop()} underlayColor={this.state.underlayColor}>
            <Text style={styles.btnText}>{rightBtnName}</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

class WatchRecord extends Component{
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const recordItem = ({item}) => {
      return (
        <View style={styles.recordItem}>
          <Text style={[styles.recordItemText, styles.recordNum]}>{item.id ? '计次' + item.id : ''}</Text>
          <Text style={[styles.recordItemText, styles.recordTime]}>{item.time}</Text>
        </View>
      )
    }
    const ItemDivideComponent = () => {
      return (
        <View style={{height: 1, backgroundColor: 'skyblue'}}/>
      )
    }
    let records = [...this.props.records];
    if (records.length <= this.props.defaultRecordLength) {
      let hasRecords = records.filter(item => item.time !== '');
      let noRecords = records.filter(item => item.time == '');
      hasRecords = hasRecords.reverse();
      records = hasRecords.concat(noRecords);
    } else {
      records = records.reverse();
    }
    return (
      <View style={styles.watchRecord}>
        <FlatList 
          data={records}
          renderItem={recordItem}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={ItemDivideComponent}
          style={styles.recordList}
        />
      </View>
    )
  }
}

const height = Dimensions.get('window').height;
const styles = StyleSheet.create({
  containPage: {
    flex: 1
  },
  watchView: {
    backgroundColor: '#FFF',
    height: 130
  },
  watchViewText: {
    fontSize: 80,
    textAlign: 'center',
    lineHeight: 130
  },

  watchAction: {
    backgroundColor: '#FFF',
    height: 130,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'skyblue'
  },
  actionBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'powderblue',
  },
  leftBtn: {
    marginLeft: 30
  },
  rightBtn: {
    marginRight: 30
  },
  btnText: {
    textAlign: 'center',
    lineHeight: 80,
    fontSize: 20
  },
  
  watchRecord: {
    height: height - 300,
    backgroundColor: '#FFF',
  },
  h100: {
    height: 100
  },
  recordItem: {
    height: 60,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  recordNum: {
    marginLeft: 20
  },
  recordTime: {
    marginRight: 20
  },
  recordItemText: {
    fontSize: 20
  }
})