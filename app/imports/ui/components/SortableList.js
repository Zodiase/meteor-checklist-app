import React from 'react';
import PropTypes from 'prop-types';
import {
  SortableContainer,
} from 'react-sortable-hoc';
import List from '@material-ui/core/List';

class SortableListComponent extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
  };

  render () {
    const {
      children,
      ...listProps
    } = this.props;

    return (
      <List
        {...listProps}
      >
        {children}
      </List>
    );
  }
}

export default
SortableContainer(SortableListComponent);
