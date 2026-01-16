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
}));

jest.unstable_mockModule('node-fetch', () => ({
    default: jest.fn(),
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


    describe('GET /api/me', () => {
        it('vrati 401 ako korisnik nije autentificiran', async () => {
            const res = await request(app).get('/api/me');
            
            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Not authenticated');
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

    
    describe('POST /api/register', () => {
        it('registrira novog setaca', async () => {
            db.createUser.mockResolvedValue({ rows: [{ idkorisnik: 10 }] });
            
            const payload = {
                ime: 'Ana', prezime: 'Anić', email: 'ana@example.com',
                telefon: '091234567', uloga: 'setac', tipClanarina: 'mjesečna'
            };

            const res = await request(app).post('/api/register').send(payload);
            
            expect(res.statusCode).toBe(200);
            expect(db.createSetac).toHaveBeenCalled();
        });

        it('vrati 400 za nedefinirane uloge', async () => {
            const res = await request(app).post('/api/register').send({ uloga: 'alien' });
            expect(res.statusCode).toBe(400);
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
});