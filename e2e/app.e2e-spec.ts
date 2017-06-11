import { ElectricarPage } from './app.po';

describe('electricar App', () => {
  let page: ElectricarPage;

  beforeEach(() => {
    page = new ElectricarPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
