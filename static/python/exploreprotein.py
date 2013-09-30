
import csv
from random import randint


def parse_csv(csvf):
    l = []
    with open(csvf, 'r') as csv_file:
        for line in csv_file:
            #print line
            l.append(line.split(','))
    return l


class StudentView():
    ''' Each instance stores all the information needed for creating jmol views
    and assesing student answers'''

    def __init__(self, csvf, abbvs):
        data = parse_csv(csvf)
        self.cols = []
        for i in range(0, 13):
            #for e in data:
                #print e[i]
            #print [entry[i] for entry in data]
            c = [entry[i] for entry in data if entry[i]]
            self.cols.append(c)
            #print self.cols
        #print self.cols

        with open(abbvs, 'rb') as abbv_file:
            a = csv.reader(abbv_file, delimiter=",")
            self.abbrevs = []
            #for i in range(12):
            self.abbrevs = [(entry[0], entry[1], entry[2], entry[3]) for entry in
                        a]
            #print self.abbrevs

             


    def format_iframe(self, amino_nos):
        """
        param amino_nos : list of amino acid numbers which are to be selected
        """

        frame = """
        <iframe src="/static/jsmol/jsmol-demo.html" width="817" height="817"
        scrolling="no"
        onLoad="javascript:window.frames[0].Jmol.script(window.frames[0].myJmol1,
        'select all;spacefill off;wireframe off; cartoon off;select protein and not
        hydrogen;dots on;select {0};dots off;spacefill
        on;select ligand; color purple; spacefill on;');"> </iframe>
        """
        to_select = ' or '.join(amino_nos) 

        return frame.format(to_select)

    def format_table_a(self, aminos):
        row = "<td> {0} ({1}) {2} </td> "
        rows = [row.format(a[3], a[2], a[4]) for a in aminos]
        table = """
        <table>
        <tr> <th> Amino acid </th> <th>Inside </th> <th> Outside</th> <th>
        Hydrophilic </th> <th> Hydrophobic </th>
        <tr>
            {0}
        </tr>
        <tr>
            {1}
        </tr>
        <tr>
            {2}
        </tr>
        <tr>
            {3}
        </tr>
        <tr>
            {4}
        </tr>
        <tr>
            {5}
        </tr>
        
        """
        out = table.format(rows[0], rows[1], rows[2], rows[3], rows[4],
                rows[5])
        return out

    def get_amino_names(self, amino_char):
        #print self.abbrevs, amino_char
        for i in self.abbrevs:
            if i[2] == amino_char:
                return (i[0], i[1], i[2])
        print "Not found"

    def split_code(self, amino_code):
        return (amino_code[0], amino_code[1:])

    def is_phobic(self, amino_char):
        for i in self.abbrevs:
            if i[2] == amino_char:
                return i[3] == "Y"
        return "Not found"

    #def _pick_from_cols(self, col_numbers, n, min_each):
        #'''
        #Picks n random elements from columns in col_numbers (in total), making
        #sure to pick at least min_each from each column.
        #:param col_numbers A list of numbers corresponding to the columns we
        #are choosing from.
        #'''
        #total = 0
        #for i in col_numbers:
            #total += len(self.col[i])

        #values = []
        #for i in col_numbers:
            #v = (,)
            #while len(v) <= min_each:
                #r = randint(range(len(self.col[i])))
                #v.add(r)
            #values.append(V)

    def _prepare_part_a(self):
        """ Pick six random elements from the two first columns, making sure
        there is at least one of each column.

        Return:
            a list of 6 amino acids (e.g "A55")
            one-letter name
            three-letter name
            the full names
            their numbers (locations)
            whether in column A
            whether phobic """

        total = len(self.cols[0]) + len(self.cols[1]) - 1
        first = randint(0, len(self.cols[0]) - 1)
        second = randint(len(self.cols[0]), total)
        values = [first, second]

        while len(values) < 7:
             
            r = randint(0, (total))
            if r:
                values.append(r)

        options = self.cols[0] + self.cols[1]
        #print options
        col_from = lambda x: x < len(self.cols[0])
        self.aminos_a = [(options[i], col_from(i)) for i in values]
        #print self.aminos_a
        all_data = []
        for am in self.aminos_a:
            code = am[0]
            one_letter, location = self.split_code(code)
            #print one_letter
            name, three_letter, a = self.get_amino_names(one_letter)
            in_col_a = (am[1] == 0)
            #print am
            phobic = self.is_phobic(one_letter)
            all_data.append((code, one_letter, three_letter, name, location,
                    in_col_a, phobic))

        return all_data

    def _prepare_part_b(self):
        """ Pick five random elements from columns C, D and E, and at least one
        from each """
        total = len(self.cols[2]) + len(self.cols[3]) + len(self.cols[4])
        first = randint(range(len(self.cols[2])))
        second = randint(range(len(self.cols[3])))
        third = randint(range(len(self.cols[4])))
        values = (first, second, third)

        while len(values) < 6:
            r = randint(range(total))
            values.add(r)

        options = self.cols[0] + self.cols[1]

        def col_from(x):
            if x < len(self.cols[0]):
                return 0
            elif x < len(self.cols[0]) + len(self.cols[3]):
                return 1
            else:
                return 2

        self.aminos_b = [(options[i], col_from(i)) for i in values]

    def _prepare_part_c(self):
        row = randint(range(len(self.cols[5])))
        self.aminos_c = [(self.cols[i][row], i) for i in range(5, 9)]

    def _prepare_part_e(self):
        row = randint(range(len(self.cols[5])))
        self.aminos_c = [(self.cols[i][row], i) for i in range(5, 9)]

if __name__ == "__main__":
    s = StudentView("/Users/jkarni/mitx_all/data/content-mit-7012x/static/data/lysozyme.txt", "/Users/jkarni/mitx_all/data/content-mit-7012x/static/data/phobic.txt")
    print s.format_table_a([a for a in s._prepare_part_a()])
    print s.format_iframe([a[4] for a in s._prepare_part_a()])
