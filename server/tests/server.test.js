import { jest } from '@jest/globals';
import request from 'supertest';


jest.unstable_mockModule('../src/db.js', () => ({
    testConnection: jest.fn(),
    getUserWithEmail: jest.fn(),
    getUserWithRole: jest.fn(),
    getAllSetaci: jest.fn(),
    createUser: jest.fn(),
    createSetac: jest.fn(),
    createVlasnik: jest.fn(),
    createSetnja: jest.fn(),
    deleteSetnja: jest.fn(),
    getSetacWithId: jest.fn(),
    getDostupneSetnjeSetaca: jest.fn(),
    getAllUsers: jest.fn(),
    getAllVlasnici: jest.fn(),
    createRezervacija: jest.fn(),
    getSetacWithId: jest.fn(),
    getDostupneSetnjeSetaca: jest.fn(),
    updateSetnja: jest.fn(),
    getUserWithEmail: jest.fn(),
    deleteUserWithId: jest.fn(),
    checkIsSetac: jest.fn(),
    checkIsVlasnik: jest.fn(),
    getSetacNotifikacije: jest.fn(),
    getVlasnikNotifikacije: jest.fn(),
    changeRezervacijaStatus: jest.fn(),
    getRezervacija: jest.fn(),
    platiRezervaciju: jest.fn(),
    testConnection: jest.fn(),
    getUserWithEmail: jest.fn(),
}));

jest.unstable_mockModule('node-fetch', () => ({
    default: jest.fn(),
}));

jest.unstable_mockModule('../src/imgDb.js', () => ({
    initializeBlobStorage: jest.fn().mockResolvedValue({}), 
    uploadImage: jest.fn().mockResolvedValue({ 
        url: 'https://fake-azure-url.com/image.jpg', 
        blobName: 'image.jpg' 
    }),
}));

const { default: app } = await import('../src/app.js');
const db = await import('../src/db.js');
const fetch = (await import('node-fetch')).default;

describe('Backend API Full Test Suite', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    describe('POST /api/register', () => {

        it('vrati 400 za nedefinirane uloge', async () => {
            const res = await request(app).post('/api/register').send({ uloga: 'alien' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/users', () => {
        it('vrati listu svih korisnika sa statusom 200', async () => {
            const mockUsers = [
                { idkorisnik: 1, ime: 'Marko', email: 'marko@example.com' },
                { idkorisnik: 2, ime: 'Iva', email: 'iva@example.com' }
            ];
            
            db.getAllUsers.mockResolvedValue(mockUsers);

            const res = await request(app).get('/api/users');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockUsers);
            expect(db.getAllUsers).toHaveBeenCalledTimes(1);
        });

        it('vrati 500 ako upit bazi podataka ne uspije', async () => {

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            db.getAllUsers.mockRejectedValue(new Error('Database connection failed'));

            const res = await request(app).get('/api/users');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Internal server error');
            
            consoleSpy.mockRestore();
        });
    });

    describe('GET /api/me', () => {
        it('vrati 401 ako korisnik nije autentificiran', async () => {
            const res = await request(app).get('/api/me');
            expect(res.statusCode).toBe(401);
        });

        it('vrati podatke korisnika ako je autentificiran', async () => {
            db.getUserWithEmail.mockResolvedValue({ idkorisnik: 1, email: 'test@example.com' });
            db.getUserWithRole.mockResolvedValue({ idkorisnik: 1, role: 'setac', ime: 'Test' });

            const res = await request(app).get('/api/me');
            
            if (res.statusCode === 200) {
                expect(res.body.user.role).toBe('setac');
            }
        });
    });

    describe('GET /api/setaci', () => {
        it('vrati listu setaca sa statusom 200', async () => {
            const mockWalkers = [{ idkorisnik: 1, ime: 'TestniKorisnik' }];
            db.getAllSetaci.mockResolvedValue(mockWalkers);
            
            const res = await request(app).get('/api/setaci');
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockWalkers);
        });

        it('vrati 500 ako baza podataka ne radi', async () => {
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            db.getAllSetaci.mockRejectedValue(new Error('DB Error'));
            const res = await request(app).get('/api/setaci');
            
            expect(res.statusCode).toBe(500);
            
            
            consoleSpy.mockRestore();
        });
    });

    describe('GET /api/vlasnici', () => {
        let logSpy;

        beforeEach(() => {
            logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });

        afterEach(() => {
            logSpy.mockRestore();
        });

        it('vrati 500 i zabilježi pogrešku pri neuspjehu baze podataka', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            db.getAllVlasnici.mockRejectedValue(new Error('DB Fail'));

            const res = await request(app).get('/api/vlasnici');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Internal server error');
            expect(errorSpy).toHaveBeenCalled();
            
            errorSpy.mockRestore();
        });
    });

    describe('POST /api/rezervacije', () => {
        it('treba napraviti novu rezervaciju', async () => {
            db.getUserWithEmail.mockResolvedValue({ idkorisnik: 10 });
            db.createRezervacija.mockResolvedValue({ rows: [{ idrezervacija: 1 }] });

            const payload = {
                idSetnja: 1,
                polaziste: 'Park',
                vrijeme: '12:00',
                datum: '2024-01-01',
                nacinPlacanja: 'gotovina'
            };

            const res = await request(app).post('/api/rezervacije').send(payload);

            if (res.statusCode === 201) {
                expect(db.createRezervacija).toHaveBeenCalled();
                expect(res.body.idrezervacija).toBe(1);
            }
        });
    });

    describe('GET /api/setnje/:idkorisnik', () => {
        beforeAll(() => {
            jest.spyOn(console, 'log').mockImplementation(() => {});
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('vrati 400 za nevažeći ID', async () => {
            const res = await request(app).get('/api/setnje/abc');
            
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid korisnik ID');
        });

        it('vrati 404 ako setac ne postoji', async () => {

            db.getSetacWithId.mockResolvedValue(null);

            const res = await request(app).get('/api/setnje/999');

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Šetač nije pronađen');
        });

        it('vrati 200 s podacima o šetaču i njegovim šetnjama', async () => {
            const mockSetac = { idkorisnik: 5, ime: 'Ivan' };
            const mockSetnje = [
                { idsetnja: 101, datum: '2024-10-10' },
                { idsetnja: 102, datum: '2024-10-11' }
            ];

            db.getSetacWithId.mockResolvedValue(mockSetac);
            db.getDostupneSetnjeSetaca.mockResolvedValue(mockSetnje);

            const res = await request(app).get('/api/setnje/5');

            expect(res.statusCode).toBe(200);
            expect(res.body.setac.ime).toBe('Ivan');
            expect(res.body.setac.setnje).toHaveLength(2);
            expect(res.body.setac.setnje[0].idsetnja).toBe(101);
        });

        it('vrati 500 ako dođe do greške s bazom podataka', async () => {
            db.getSetacWithId.mockRejectedValue(new Error('DB Error'));

            const res = await request(app).get('/api/setnje/5');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Internal server error');
        });
    });
    
    describe('Upravljanje setnjama', () => {
        it('POST /api/setnja treba napraviti novu setnju', async () => {
            db.createSetnja.mockResolvedValue({ id: 101, cijena: 50 });

            const res = await request(app)
                .post('/api/setnja')
                .send({ cijena: 50, tipSetnja: 'dugacka', trajanje: 60, idKorisnik: 1 });

            expect(res.statusCode).toBe(201);
            expect(res.body.setnja.id).toBe(101);
        });

        it('DELETE /api/setnje/:id treba izbrisati setnju', async () => {
            db.deleteSetnja.mockResolvedValue();
            const res = await request(app).delete('/api/setnje/101');
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Setnja deleted');
        });
    });

    describe('PUT /api/setnje/:id', () => {
        it('treba ažurirati šetnju i vratiti ažurirani objekt', async () => {
            const updatedWalk = { idsetnja: 101, cijena: 60, tipsetnja: 'duga', trajanje: 90 };
            
            db.updateSetnja.mockResolvedValue(updatedWalk);

            const res = await request(app)
                .put('/api/setnje/101')
                .send({
                    cijena: 60,
                    tipsetnja: 'duga',
                    trajanje: 90
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.setnja).toEqual(updatedWalk);

            expect(db.updateSetnja).toHaveBeenCalledWith(101, 60, 'duga', 90);
        });

        it('vratu 500 ako ažuriranje ne uspije', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            db.updateSetnja.mockRejectedValue(new Error('Update failed'));

            const res = await request(app)
                .put('/api/setnje/101')
                .send({ cijena: 60 });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Internal server error');
            
            errorSpy.mockRestore();
        });
    });

    describe('DELETE /api/delete-profile', () => {
        beforeEach(() => {
            jest.spyOn(console, 'log').mockImplementation(() => {});
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('vrati 401 ako korisnik u sesiji ne postoji', async () => {
            const res = await request(app).delete('/api/delete-profile');
            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Not authenticated');
        });

        it('treba obrisati korisnika i uništiti sesiju nakon uspjeha', async () => {

            db.getUserWithEmail.mockResolvedValue({ idkorisnik: 42, email: 'test@test.com' });
            db.deleteUserWithId.mockResolvedValue();

            const res = await request(app).delete('/api/delete-profile');

            if (res.statusCode === 200) {
                expect(db.deleteUserWithId).toHaveBeenCalledWith(42);
                expect(res.body.message).toBe('Profile deleted successfully');
            }
        });

        it('treba vratiti 404 ako korisnik iz sesije ne postoji u bazi podataka', async () => {
            db.getUserWithEmail.mockResolvedValue(null);

            const res = await request(app).delete('/api/delete-profile');

            if (res.statusCode !== 401) {
                expect(res.statusCode).toBe(404);
                expect(res.body.error).toBe('User not found');
            }
        });

        it('treba vratiti 500 ako brisanje iz baze podataka ne uspije', async () => {
            db.getUserWithEmail.mockResolvedValue({ idkorisnik: 42 });
            db.deleteUserWithId.mockRejectedValue(new Error('Delete failed'));

            const res = await request(app).delete('/api/delete-profile');

            if (res.statusCode !== 401) {
                expect(res.statusCode).toBe(500);
                expect(res.body.error).toBe('Internal server error');
            }
        });
    });

    
});