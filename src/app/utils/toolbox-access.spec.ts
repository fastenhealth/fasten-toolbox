import {getToolboxAccessExternalId} from './toolbox-access';

describe('getToolboxAccessExternalId', () => {
  it('reads and Base64URL encodes the Toolbox access email', () => {
    const documentMock = {
      cookie: 'another_cookie=value; toolbox_access_email=jane%2Btoolbox%40example.com',
    } as Document;

    expect(getToolboxAccessExternalId(documentMock))
      .toBe('amFuZSt0b29sYm94QGV4YW1wbGUuY29t');
  });

  it('encodes non-ASCII email addresses as UTF-8', () => {
    const documentMock = {
      cookie: 'toolbox_access_email=jos%C3%A9%40example.com',
    } as Document;

    expect(getToolboxAccessExternalId(documentMock))
      .toBe('am9zw6lAZXhhbXBsZS5jb20');
  });

  it('returns an empty value when the cookie is unavailable or malformed', () => {
    expect(getToolboxAccessExternalId({cookie: ''} as Document)).toBe('');
    expect(getToolboxAccessExternalId({cookie: 'toolbox_access_email=%E0%A4%A'} as Document)).toBe('');
  });
});
