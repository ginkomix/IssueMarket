import {compose} from 'recompose';
import {connect} from 'react-redux';

import PageMain from './PageMain'

export default compose(
  connect(
    () => ({}),
  )
)(PageMain);