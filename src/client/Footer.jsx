import React from 'react';
import { paging } from './setting';
import Events, { UPDATE_PAGE } from './reader/Events';
import { goToPage } from './content-loader';

export default class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...paging };
    this.onPagingUpdated = this.onPagingUpdated.bind(this);
    this.onInputCurrentPage = this.onInputCurrentPage.bind(this);
  }

  componentDidMount() {
    Events.on(UPDATE_PAGE, this.onPagingUpdated);
  }

  onPagingUpdated(paging) {
    this.setState({ ...paging });
  }

  onInputCurrentPage(e) {
    if (e.key === 'Enter') {
      goToPage(this.state.currentPage);
    } else {
      const newValue = parseInt(e.target.value, 10);
      this.setState({ currentPage: newValue });
    }
  }

  render() {
    const { currentPage, totalPage } = this.state;
    return (
      <div id="footer" className="footer_area">
        <div className="footer_paging_status">
          <input
            type="number"
            value={currentPage}
            onKeyUp={this.onInputCurrentPage}
            onChange={this.onInputCurrentPage}
          />
          / {totalPage}
        </div>
      </div>
    );
  }
}
