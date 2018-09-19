import React from 'react';
import PropTypes from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';
import ListItem from '@material-ui/core/ListItem';

class SortableListItemComponent extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
  };

  render() {
    const { children, ...listItemProps } = this.props;

    return <ListItem {...listItemProps}>{children}</ListItem>;
  }
}

export default SortableElement(SortableListItemComponent);
